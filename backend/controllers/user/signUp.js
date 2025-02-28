import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import HTTPError from "../../utils/http-error.js";
import { RoleType } from "@prisma/client";
import fastify from "fastify";

const prisma = new PrismaClient();

export const signUp = {
  schema: {
    body: {
      type: "object",
      properties: {
        firstName: {
          type: "string",
        },
        lastName: {
          type: "string",
        },
        email: {
          type: "string",
          format: "email",
        },
        password: {
          type: "string",
        },
      },
      required: ["firstName", "lastName", "email", "password"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          firstName: {
            type: "string",
          },
          lastName: {
            type: "string",
          },
          email: {
            type: "string",
          },
        },
      },
    },
  },
  handler: async (req, rep) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      throw new HTTPError("Missing field(s)", 400);
    }

    try {
      await prisma.$transaction(async (trx) => {
        const duplicateUser = await trx.user.findFirst({
          where: {
            email: email,
          },
        });

        if (duplicateUser) {
          throw new HTTPError("Duplicate user", 409);
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const firstUser = await trx.user.findFirst();
        const newUser = await trx.user.create({
          data: {
            ...req.body,
            password: hashedPassword,
            ...(!firstUser && { role: RoleType.SUPER_ADMIN }),
          },
        });

        return rep.code(201).send({ ...newUser });
      });
    } catch (err) {
      throw err;
    }
  },
};
