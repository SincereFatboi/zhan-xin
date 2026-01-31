import {
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const deleteScores = async (req, res) => {
  try {
    let { scoreName } = req.params;

    if (!scoreName) {
      return res.status(400).json({ message: "Score name is required" });
    }

    scoreName = decodeURIComponent(scoreName.trim());

    try {
      await s3.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: scoreName,
        }),
      );
    } catch (err) {
      const isMissing =
        err?.$metadata?.httpStatusCode === 404 ||
        err?.$metadata?.httpStatusCode === 403 ||
        err?.name === "NotFound" ||
        err?.name === "NoSuchKey";

      if (!isMissing) throw err;

      try {
        await prisma.$transaction(async (trx) => {
          await trx.score.deleteMany({ where: { scoreName } });

          const rooms = await trx.room.findMany({
            select: { id: true, scores: true },
          });
          for (const room of rooms) {
            if (
              room?.scores &&
              Object.prototype.hasOwnProperty.call(room.scores, scoreName)
            ) {
              const nextScores = { ...room.scores };
              delete nextScores[scoreName];
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

      return res.status(200).json({
        message: "Score successfully deleted from storage and references",
      });
    }

    // Prevent deletion if any room still references this score
    const roomsUsingScore = await prisma.room.findMany({
      select: { roomName: true, scores: true },
    });

    const inUseBy = roomsUsingScore
      .filter(
        (room) =>
          room?.scores &&
          Object.prototype.hasOwnProperty.call(room.scores, scoreName),
      )
      .map((room) => room.roomName);

    if (inUseBy.length > 0) {
      return res.status(400).json({
        message: `Score '${scoreName}' used in room(s): ${inUseBy.join(", ")}`,
      });
    }

    // Delete directly from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: scoreName,
      }),
    );

    // Remove the record from the database
    await prisma.score.delete({
      where: { scoreName },
    });

    return res.status(200).json({
      message: `Score '${scoreName}' deleted successfully`,
    });
  } catch (err) {
    throw err;
  }
};
