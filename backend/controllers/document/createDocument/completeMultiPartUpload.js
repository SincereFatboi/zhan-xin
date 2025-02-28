import { S3Client, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import HTTPError from "../../../utils/http-error.js";
import { PrismaClient } from "@prisma/client";

export const completeMultiPartUpload = {
  schema: {
    body: {
      type: "object",
      properties: {
        key: { type: "string" },
        uploadId: { type: "string" },
        uploadResults: { type: "array" },
      },
      required: ["key", "uploadId", "uploadResults"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          ok: {
            type: "boolean",
          },
        },
      },
    },
  },
  handler: async (req, rep) => {
    const prisma = new PrismaClient();
    const { key, uploadId, uploadResults } = req.body;
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    try {
      const completeMultiPartUpload = await s3.send(
        new CompleteMultipartUploadCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: {
            Parts: uploadResults.map((uploadResult, index) => {
              return { ETag: uploadResult.data.ETag, PartNumber: index + 1 };
            }),
          },
        })
      );

      return rep.code(200).send({ ok: true });
    } catch (err) {
      console.log("🚀 ~ handler: ~ err:", err);
      throw new HTTPError("Not Acceptable", 406);
    }
  },
};
