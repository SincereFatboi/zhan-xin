import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createRoom = async (req, res) => {
  const { roomName, scores } = req.body;

  if (!scores || !roomName) {
    return res.status(400).json({ message: "Missing required field(s)" });
  }

  if (/^[A-Za-z0-9_\-()]+$/.test(roomName) === false) {
    return res
      .status(400)
      .json({ message: "Room name contains invalid characters" });
  }

  if (roomName.length > 30) {
    return res.status(400).json({ message: "Room name is too long" });
  }

  if (!Array.isArray(scores)) {
    return res.status(400).json({ message: "Scores are invalid" });
  }

  const formatScores = Object.fromEntries(
    scores
      .filter((s) => typeof s === "string" && s.length > 0)
      .map((s) => [s, 0]),
  );

  try {
    await prisma.$transaction(async (trx) => {
      const existingRoom = await trx.room.findFirst({
        where: { roomName: roomName },
        select: { scores: true },
      });

      if (existingRoom) {
        await trx.room.update({
          where: { roomName: roomName },
          data: { scores: { ...existingRoom.scores, ...formatScores } },
        });

        return res
          .status(200)
          .json({ message: `Room '${roomName}' updated successfully` });
      }

      await trx.room.create({
        data: {
          roomName,
          scores: formatScores,
        },
      });
      return res
        .status(201)
        .json({ message: `Room '${roomName}' created successfully` });
    });
  } catch (err) {
    console.error("Error creating/updating room", err);
    return res.status(500).json({ message: "Error creating/updating room" });
  }
};
