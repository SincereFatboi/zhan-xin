import { PrismaClient } from "@prisma/client";
import HTTPError from "../../utils/http-error.js";
import { RoleType } from "@prisma/client";
import fastify from "fastify";

const prisma = new PrismaClient();

export const refreshToken = {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
          },
          id: {
            type: "string",
          },
          role: {
            type: "string",
          },
        },
      },
    },
  },
  handler: async (req, rep) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      throw new HTTPError("Unauthorized", 401);
    }
    const refreshToken = cookies.jwt;
    rep.clearCookie("jwt", {
      //   domain: "your.domain",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: true,
      maxAge: 72 * 60 * 1000,
    });

    try {
      await prisma.$transaction(async (trx) => {
        const foundUser = await trx.user.findFirst({
          where: {
            refreshToken: {
              has: refreshToken,
            },
          },
        });

        // Detected refresh token reuse
        if (!foundUser) {
          try {
            const decoded = await req.jwtVerify(refreshToken);
            await prisma.$transaction(async (trx) => {
              const hackedUser = await trx.user.findUnique({
                where: {
                  id: decoded.id,
                },
              });

              await trx.user.update({
                where: {
                  id: hackedUser.id,
                },
                data: {
                  refreshToken: [],
                },
              });
            });
          } catch (err) {
            if (err) throw new HTTPError("Unauthorized", 401);
          }
        }

        const newRefreshTokenArray = foundUser.refreshToken.filter(
          (rt) => rt !== refreshToken
        );

        try {
          const decoded = await req.jwtVerify(refreshToken);

          if (foundUser.id !== decoded.id) {
            throw new HTTPError("Forbidden", 403);
          }
        } catch (err) {
          await trx.user.update({
            where: {
              id: foundUser.id,
            },
            data: {
              refreshToken: [...newRefreshTokenArray],
            },
          });
        }

        const accessToken = await rep.jwtSign(
          {
            id: foundUser.id,
            role: foundUser.role,
          },
          { expiresIn: "30m" }
        );

        const newRefreshToken = await rep.jwtSign(
          {
            id: foundUser.id,
            role: foundUser.role,
          },
          { expiresIn: "3d" }
        );

        await trx.user.update({
          where: {
            id: foundUser.id,
          },
          data: {
            refreshToken: [...newRefreshTokenArray, newRefreshToken],
          },
        });

        return rep
          .setCookie("jwt", newRefreshToken, {
            //   domain: "your.domain",
            path: "/",
            secure: true,
            httpOnly: true,
            sameSite: true,
            maxAge: 72 * 60 * 1000,
          })
          .code(200)
          .send({
            accessToken: accessToken,
            id: foundUser.id,
            role: foundUser.role,
          });
      });
    } catch (err) {
      throw err;
    }
  },
};
