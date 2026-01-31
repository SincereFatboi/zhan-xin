import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const trimmedSearch = search.trim();

    const whereClause = trimmedSearch
      ? {
          OR: [
            { username: { contains: trimmedSearch, mode: "insensitive" } },
            { firstName: { contains: trimmedSearch, mode: "insensitive" } },
            { lastName: { contains: trimmedSearch, mode: "insensitive" } },
          ],
        }
      : undefined;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        status: true,
        role: true,
        createdAt: true,
      },
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};
