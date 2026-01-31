import { PrismaClient } from "@prisma/client";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

export const getAllScores = async (req, res) => {
  try {
    const search = req.query.search?.trim();

    const allScores = await prisma.score.findMany({
      where: search
        ? {
            scoreName: {
              contains: search,
              mode: "insensitive",
            },
          }
        : undefined,
      select: {
        id: true,
        scoreName: true,
        fullName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const existingScores = [];

    for (const score of allScores) {
      try {
        await s3.send(
          new HeadObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: score.scoreName,
          }),
        );
        existingScores.push(score);
      } catch (err) {
        const isMissing =
          err?.$metadata?.httpStatusCode === 404 ||
          err?.$metadata?.httpStatusCode === 403 ||
          err?.name === "NotFound" ||
          err?.name === "NoSuchKey";

        if (isMissing) {
          try {
            await prisma.$transaction(async (trx) => {
              await trx.score.deleteMany({
                where: { scoreName: score.scoreName },
              });

              const rooms = await trx.room.findMany({
                select: { id: true, scores: true },
              });

              for (const room of rooms) {
                if (
                  room?.scores &&
                  Object.prototype.hasOwnProperty.call(
                    room.scores,
                    score.scoreName,
                  )
                ) {
                  const nextScores = { ...room.scores };
                  delete nextScores[score.scoreName];
                  await trx.room.update({
                    where: { id: room.id },
                    data: { scores: nextScores },
                  });
                }
              }
            });
          } catch (cleanupErr) {
            console.error("Cleanup failed for missing score", cleanupErr);
          }
        } else {
          console.error("HeadObject check failed", err);
        }
      }
    }

    return res.status(200).json({ scores: existingScores });
  } catch (err) {
    throw err;
  }
};
