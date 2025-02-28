import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import HTTPError from "../../utils/http-error.js";

export const createRoom = {
  schema: {
    body: {
      type: "object",
      properties: {
        roomName: {
          type: "string",
        },
        password: {
          type: "string",
        },
        documents: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
      },
      required: ["roomName", "password", "documents"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          ok: { type: "boolean" },
        },
      },
    },
  },
  handler: async (req, rep) => {
    const prisma = new PrismaClient();
    const { roomName, password, documents } = req.body;
    const { id } = req.user;

    try {
      await prisma.$transaction(async (trx) => {
        const duplicateRoomName = await trx.room.findFirst({
          where: {
            roomName,
          },
        });

        if (duplicateRoomName) {
          throw new HTTPError("Duplicate room name", 409);
        }

        const existingDocuments = await trx.document.findMany({
          where: {
            documentKey: {
              in: documents,
            },
          },
          select: {
            documentKey: true,
          },
        });

        if (existingDocuments.length !== documents.length) {
          throw new HTTPError("Document does not exist", 404);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newRoom = await trx.room.create({
          data: {
            roomName,
            password: hashedPassword,
            clients: {
              set: [id],
            },
            documents: {
              set: [...documents],
            },
          },
        });

        return rep.code(201).send({ ok: true, ...newRoom });
      });
    } catch (err) {
      throw err;
    }
  },
};
