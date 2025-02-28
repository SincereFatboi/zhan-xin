import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import HTTPError from "../../utils/http-error.js";

const prisma = new PrismaClient();

export const auth = {
  schema: {
    body: {
      type: "object",
      properties: {
        email: {
          type: "string",
          format: "email",
        },
        password: {
          type: "string",
        },
      },
      required: ["email", "password"],
    },
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
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HTTPError("Missing field(s)", 400);
    }

    try {
      await prisma.$transaction(async (trx) => {
        const foundUser = await trx.user.findFirst({
          where: {
            email: email,
          },
        });

        if (!foundUser) {
          throw new HTTPError("Unauthorized", 401);
        }

        const comparePassword = await bcrypt.compare(
          password,
          foundUser.password
        );

        if (comparePassword) {
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

          const newRefreshTokenArray = !cookies.jwt
            ? foundUser.refreshToken
            : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

          if (cookies?.jwt) {
            rep.clearCookie("jwt", {
              //   domain: "your.domain",
              path: "/",
              secure: true,
              httpOnly: true,
              sameSite: true,
              maxAge: 72 * 60 * 1000,
            });
          }

          await prisma.user.update({
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
              accessToken,
              id: foundUser.id,
              role: foundUser.role,
            });
        } else {
          throw new HTTPError("Unauthorized", 401);
        }
      });
    } catch (err) {
      throw err;
    }
  },
};
