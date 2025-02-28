import { PrismaClient } from "@prisma/client";
import HTTPError from "../../utils/http-error.js";
import { RoleType } from "@prisma/client";
import fastify from "fastify";

const prisma = new PrismaClient();

export const signOut = {
  schema: {
    response: {
      204: {
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
    const cookies = req.cookies;
    if (!cookies?.jwt) return rep.code(204).send();
    const refreshToken = cookies.jwt;

    try {
      await prisma.$transaction(async (trx) => {
        const foundUser = await trx.user.findFirst({
          where: {
            refreshToken: {
              has: refreshToken,
            },
          },
        });

        if (!foundUser) {
          rep.clearCookie("jwt", {
            //   domain: "your.domain",
            path: "/",
            secure: true,
            httpOnly: true,
            sameSite: true,
            maxAge: 72 * 60 * 1000,
          });
          throw new HTTPError("Unauthorized", 401);
        }

        await trx.user.update({
          where: {
            id: foundUser.id,
          },
          data: {
            refreshToken: foundUser.refreshToken.filter(
              (rt) => rt !== refreshToken
            ),
          },
        });

        rep.clearCookie("jwt", {
          //   domain: "your.domain",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: true,
          maxAge: 72 * 60 * 1000,
        });

        return rep.code(200).send({ ok: true });
      });
    } catch (err) {
      throw err;
    }
  },
};
