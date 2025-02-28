import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import HTTPError from "../../../utils/http-error.js";
import { PrismaClient } from "@prisma/client";

export const abortMultiPartUpload = {
  schema: {
    body: {
      type: "object",
      properties: {
        key: { type: "string" },
        uploadId: { type: "string" },
      },
      required: ["key", "uploadId"],
    },
  },
  handler: async (req, rep) => {
    const prisma = new PrismaClient();
    const { key, uploadId } = req.body;

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    try {
      const abortMultiPartUpload = await s3.send(
        new AbortMultipartUploadCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: key,
          UploadId: uploadId,
        })
      );

      return rep.code(200).send(abortMultiPartUpload);
    } catch (err) {
      console.log("🚀 ~ handler: ~ err:", err);
      throw new HTTPError("Not Acceptable", 406);
    }
  },
};
