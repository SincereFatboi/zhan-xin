import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { StatusType } from "@prisma/client";

const prisma = new PrismaClient();

export const signIn = async (req, res) => {
  const cookies = req.cookies;
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing field(s)" });
  }

  try {
    await prisma.$transaction(async (trx) => {
      const foundUser = await trx.user.findFirst({
        where: {
          username: username,
        },
      });

      if (!foundUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const comparePassword = await bcrypt.compare(
        password,
        foundUser.password,
      );

      if (comparePassword) {
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

        let newRefreshTokenArray = !cookies.jwt
          ? foundUser.refreshToken
          : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

        if (cookies?.jwt) {
          const refreshToken = cookies.jwt;
          const foundToken = await prisma.user.findFirst({
            where: {
              refreshToken: { has: refreshToken },
            },
          });

          if (!foundToken) {
            console.log("Attempted refresh token reuse at: " + new Date());
            newRefreshTokenArray = [];
          }

          res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "Lax",
            secure: false,
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

        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          sameSite: "Lax",
          secure: false,
          maxAge: 3 * 24 * 60 * 60 * 1000,
        });

        if (foundUser.status === StatusType.PENDING) {
          return res.status(403).json({ message: "Account status is pending" });
        }

        return res.status(200).json({
          accessToken,
          id: foundUser.id,
          role: foundUser.role,
          username: foundUser.username,
          status: foundUser.status,
        });
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    });
  } catch (err) {
    console.error("Error during sign in", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
