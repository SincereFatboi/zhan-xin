import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const refreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
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
          const decoded = await req.jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
          );

          const hackedUser = await trx.user.findFirst({
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
        } catch (err) {
          if (err) return res.status(403).json({ message: "Forbidden" });
        }
      }

      const newRefreshTokenArray = foundUser.refreshToken.filter(
        (rt) => rt !== refreshToken,
      );

      try {
        const decoded = await req.jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );

        if (foundUser.id !== decoded.id) {
          return res.status(403).json({ message: "Forbidden" });
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

      const accessToken = jwt.sign(
        {
          id: foundUser.id,
          role: foundUser.role,
          username: foundUser.username,
          status: foundUser.status,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" },
      );

      const newRefreshToken = jwt.sign(
        {
          id: foundUser.id,
          role: foundUser.role,
          username: foundUser.username,
          status: foundUser.status,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" },
      );

      await trx.user.update({
        where: {
          id: foundUser.id,
        },
        data: {
          refreshToken: [...newRefreshTokenArray, newRefreshToken],
        },
      });

      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        accessToken: accessToken,
        id: foundUser.id,
        role: foundUser.role,
        username: foundUser.username,
        status: foundUser.status,
      });
    });
  } catch (err) {
    console.error("Error during token refresh", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
