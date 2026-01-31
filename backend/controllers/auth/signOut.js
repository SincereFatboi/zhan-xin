import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const signOut = async (req, res) => {
  const refreshToken = req.cookies?.jwt;

  if (!refreshToken) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    });
    return res.status(204).json({ message: "No content" });
  }

  try {
    const foundUser = await prisma.user.findFirst({
      where: {
        refreshToken: {
          has: refreshToken,
        },
      },
    });

    // Token not found in DB, but clear cookie anyway
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
      });
      return res.status(204).json({ message: "No content" });
    }

    // Remove this refresh token from the list
    await prisma.user.update({
      where: {
        id: foundUser.id,
      },
      data: {
        refreshToken: foundUser.refreshToken.filter(
          (rt) => rt !== refreshToken,
        ),
      },
    });

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    });

    return res.status(200).json({ message: "Signed out" });
  } catch (err) {
    console.error("Error during sign out", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
