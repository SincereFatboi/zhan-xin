import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllRooms = async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const allRooms = await prisma.room.findMany({
      where: search
        ? {
            roomName: {
              contains: search,
              mode: "insensitive",
            },
          }
        : undefined,
      select: {
        id: true,
        roomName: true,
        scores: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ rooms: allRooms });
  } catch (err) {
    console.error("Error fetching rooms", err);
    return res.status(500).json({ message: "Error fetching rooms" });
  }
};
