import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateRoom = async (req, res) => {
  let { roomName } = req.params;
  const { roomName: newRoomName, scores } = req.body;

  if (!newRoomName || !scores) {
    return res.status(400).json({ message: "Missing required field(s)" });
  }

  if (/^[A-Za-z0-9_\-()]+$/.test(newRoomName) === false) {
    return res
      .status(400)
      .json({ message: "Room name contains invalid characters" });
  }

  if (newRoomName.length > 30) {
    return res.status(400).json({ message: "Room name is too long" });
  }

  if (typeof scores !== "object") {
    return res.status(400).json({ message: "Scores are invalid" });
  }

  roomName = decodeURIComponent(roomName);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existingRoom = await tx.room.findFirst({
        where: { roomName },
      });

      if (!existingRoom) {
        return res.status(404).json({ message: "Room not found" });
      }

      return tx.room.update({
        where: { roomName },
        data: {
          roomName: newRoomName?.trim(),
          scores,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          roomName: true,
          scores: true,
          createdAt: true,
        },
      });
    });

    return res.status(200).json({ message: "Room updated", room: updated });
  } catch (err) {
    console.error("Error updating room", err);
    return res.status(500).json({ message: "Error updating room" });
  }
};
