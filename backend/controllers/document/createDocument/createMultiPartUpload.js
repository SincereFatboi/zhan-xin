import { S3Client, CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import HTTPError from "../../../utils/http-error.js";
import { PrismaClient } from "@prisma/client";

export const createMultiPartUpload = {
  schema: {
    body: {
      type: "object",
      properties: {
        key: { type: "string" },
      },
      required: ["key"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          ok: {
            type: "boolean",
          },
          UploadId: {
            type: "string",
          },
        },
      },
    },
  },
  handler: async (req, rep) => {
    const prisma = new PrismaClient();
    const { key } = req.body;

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    try {
      const createMultiPartUpload = await s3.send(
        new CreateMultipartUploadCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: key,
        })
      );

      return rep
        .code(200)
        .send({ ok: true, UploadId: createMultiPartUpload.UploadId });
    } catch (err) {
      throw new HTTPError("Not Acceptable", 406);
    }
  },
};
