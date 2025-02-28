import { PrismaClient } from "@prisma/client";
import HTTPError from "../../utils/http-error.js";
import fastify from "fastify";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const me = {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          role: { type: "string" },
        },
      },
    },
  },
  handler: async (req, rep) => {
    const { id, role } = req.user;

    return rep.code(200).send({ id, role });
  },
};
