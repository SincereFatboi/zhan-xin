import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadScores = async (req, res) => {
  try {
    let Key = req.query.scoreName;

    Key = decodeURIComponent(Key.trim());

    if (!Key || Key.split(".").pop() === undefined) {
      return res.status(400).json({ message: "Score name is required" });
    }

    const ext = Key.split(".")?.pop();
    const allowedExtensions = ["pdf", "docx", "docm", "doc"];
    if (!ext || !allowedExtensions.includes(ext)) {
      return res
        .status(400)
        .json({ message: "Only pdf, docx, docm, and doc files are allowed" });
    }

    await prisma.$transaction(async (trx) => {
      const existingScore = await trx.score.findFirst({
        where: { scoreName: Key.split(".")[0] + ".html" },
      });

      if (existingScore) {
        return res.status(409).json({ message: "Score already exists" });
      }

      const user = await trx.user.findFirst({
        where: { id: req.id },
        select: { firstName: true, lastName: true },
      });

      await trx.score.create({
        data: {
          scoreName: Key,
          fullName: `${user.firstName} ${user.lastName}`,
        },
      });
      const uploadURL = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key,
        }),
        { expiresIn: 60 },
      );
      return res.status(200).json({ uploadURL });
    });
  } catch (err) {
    console.error("Error uploading score", err);
    return res.status(500).json({ message: "Error uploading score" });
  }
};
