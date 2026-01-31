import { PrismaClient } from "@prisma/client";
import { getRoomOccupancy } from "../../sockets/index.js";

const prisma = new PrismaClient();

export const deleteRooms = async (req, res) => {
  let { roomName } = req.params;
  roomName = decodeURIComponent(roomName.trim());

  if (!roomName) {
    return res.status(400).json({ message: "Room name is required" });
  }

  try {
    const activeUsers = getRoomOccupancy(roomName);
    if (activeUsers > 0) {
      return res.status(409).json({
        message: `Room '${roomName}' is currently active`,
      });
    }

    const deleted = await prisma.room.delete({
      where: { roomName },
    });
    return res
      .status(200)
      .json({ message: "Room deleted successfully", room: deleted });
  } catch (err) {
    throw err;
  }
};
