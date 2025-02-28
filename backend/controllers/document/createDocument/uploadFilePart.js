import { S3Client, UploadPartCommand } from "@aws-sdk/client-s3";
import HTTPError from "../../../utils/http-error.js";
import { Buffer } from "buffer";
import { PrismaClient } from "@prisma/client";

export const uploadFilePart = {
  schema: {
    body: {
      type: "object",
      properties: {
        key: { type: "string" },
        uploadId: { type: "string" },
        filePart: {
          type: "object",
        },
        iteration: { type: "integer" },
      },
      required: ["key", "uploadId", "filePart", "iteration"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          ok: { type: "boolean" },
          ETag: {
            type: "string",
          },
        },
      },
    },
  },
  handler: async (req, rep) => {
    const prisma = new PrismaClient();
    const { key, uploadId, filePart, iteration } = req.body;
    const buffer = Buffer.isBuffer(filePart)
      ? filePart
      : Buffer.from(filePart, "binary");
    // console.log("🚀 ~ handler: ~ buffer:", Buffer.byteLength(buffer));

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    try {
      const uploadFilePart = await s3.send(
        new UploadPartCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: key,
          UploadId: uploadId,
          Body: buffer,
          PartNumber: iteration + 1,
        })
      );

      return rep.code(200).send({ ok: true, ETag: uploadFilePart.ETag });
    } catch (err) {
      throw new HTTPError("Not Acceptable", 406);
    }
  },
};
