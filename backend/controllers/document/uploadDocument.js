import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import HTTPError from "../../utils/http-error.js";
import { PrismaClient } from "@prisma/client";

export const uploadDocument = {
  schema: {
    consumes: ["multipart/form-data"],
    body: {
      type: "object",
      required: ["document"],
      properties: {
        document: {
          type: "array",
          minItems: 1,
          maxItems: 1,
          items: {
            type: "object",
            required: ["data", "filename", "mimetype", "limit"],
            properties: {
              filename: { type: "string" },
              mimetype: { type: "string" },
              limit: { type: "boolean" },
            },
          },
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          ok: { type: "boolean" },
          message: { type: "string" },
        },
      },
    },
  },
  handler: async (req, rep) => {
    const prisma = new PrismaClient();
    const { data, filename, mimetype } = req.body.document[0];
    const { id } = req.user;

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const fileBuffer = Buffer.from(data, "base64");

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: filename,
      Body: fileBuffer,
      ContentType: mimetype,
    });

    try {
      await s3.send(command);

      await prisma.$transaction(async (trx) => {
        const duplicateDocument = await trx.document.findFirst({
          where: {
            documentKey: filename,
          },
        });
        if (duplicateDocument) {
          throw new HTTPError("Duplicate document", 409);
        }

        await trx.document.create({
          data: {
            documentKey: filename,
            createdBy: id,
          },
        });
      });

      return rep.code(200).send({
        ok: true,
        message: `${filename} uploaded successfully`,
      });
    } catch (err) {
      throw err;
    }
  },
};
