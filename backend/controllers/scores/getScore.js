import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const prisma = new PrismaClient();

export const getScore = async (req, res) => {
  try {
    let Key = req.query.score;
    Key = decodeURIComponent(Key.trim());

    if (!Key) {
      return res.status(400).json({ message: "Score name is required" });
    }

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    try {
      await s3.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key,
        }),
      );
    } catch (err) {
      if (
        err?.$metadata?.httpStatusCode === 404 ||
        err?.$metadata?.httpStatusCode === 403
      ) {
        try {
          await prisma.$transaction(async (trx) => {
            await trx.score.deleteMany({ where: { scoreName: Key } });

            const rooms = await trx.room.findMany({
              select: { id: true, scores: true },
            });

            for (const room of rooms) {
              if (
                room?.scores &&
                Object.prototype.hasOwnProperty.call(room.scores, Key)
              ) {
                const nextScores = { ...room.scores };
                delete nextScores[Key];
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
        return res.status(404).json({ message: "Score not found" });
      }
      console.error("HeadObject error:", err);
      return res.status(500).json({ message: "Error checking score" });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key,
    });

    const presignedURL = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.status(200).json({ presignedURL });
  } catch (err) {
    console.error("Error fetching score:", err);
    return res.status(500).json({ message: "Error fetching score" });
  }
};
