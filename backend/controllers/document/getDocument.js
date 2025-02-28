import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import HTTPError from "../../utils/http-error.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getDocument = {
  schema: {
    params: {
      type: "object",
      properties: {
        documentKey: {
          type: "string",
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          ok: { type: "boolean" },
          url: {
            type: "string",
          },
        },
      },
    },
  },
  handler: async (req, rep) => {
    console.log("🚀 ~ handler: ~ rep:", req.user);
    const { documentKey } = req.params;

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: documentKey,
    });

    try {
      const presignedURL = await getSignedUrl(s3, command, { expiresIn: 30 });

      return rep.code(200).send({ ok: true, url: presignedURL });
    } catch (err) {
      console.log("🚀 ~ handler: ~ err:", err);
      throw new HTTPError("Not Acceptable", 406);
    }
  },
};
