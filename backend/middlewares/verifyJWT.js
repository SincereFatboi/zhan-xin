import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Nothing wrong with this middleware code
export const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });
  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, username: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.id = user.id;
    req.role = user.role;
    req.username = user.username;
    req.status = user.status;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
