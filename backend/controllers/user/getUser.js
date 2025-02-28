import { PrismaClient } from "@prisma/client";
import HTTPError from "../../utils/http-error.js";

export const getUser = {
  schema: {
    params: {
      type: "object",
      properties: {
        userID: {
          type: "string",
        },
      },
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
    const prisma = new PrismaClient();
    const userID = req.params.userID || req.user.id;

    try {
      const foundUser = await prisma.user.findUnique({
        where: {
          id: userID,
        },
      });

      if (!foundUser) {
        throw new HTTPError("Not Found", 404);
      }

      return rep.code(200).send({
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
      });
    } catch (err) {
      throw err;
    }
  },
};
