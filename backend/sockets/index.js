import jwt from "jsonwebtoken";
import HTTPError from "../utils/http-error.js";

const roomKeys = new Map();
const roomScoreIndex = new Map();
const allUsers = new Map();
const roomParticipants = new Map();

const addParticipant = (roomName, userId) => {
  if (!roomName || !userId) return;
  const set = roomParticipants.get(roomName) ?? new Set();
  set.add(userId);
  roomParticipants.set(roomName, set);
};

const removeParticipant = (roomName, userId) => {
  if (!roomName || !userId) return;
  const set = roomParticipants.get(roomName);
  if (!set) return;
  set.delete(userId);
  if (set.size === 0) {
    roomParticipants.delete(roomName);
  }
};

export const cleanupUserSessions = (userId) => {
  if (!userId) return;
  allUsers.delete(userId);
  for (const [roomName, set] of roomParticipants.entries()) {
    if (set.has(userId)) {
      set.delete(userId);
      if (set.size === 0) {
        roomParticipants.delete(roomName);
      }
    }
  }
};

export const getRoomOccupancy = (roomName) => {
  if (!roomName) return 0;
  return roomParticipants.get(roomName)?.size ?? 0;
};

const initSockets = (io, prisma) => {
  // Auth middleware for sockets
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("No token"));

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return next(new Error("Invalid token"));

        if (allUsers.has(decoded.id, decoded.username)) {
          return next(new Error("Duplicate session"));
        }

        socket.data.id = decoded.id;
        socket.data.role = decoded.role;
        socket.data.username = decoded.username;
        allUsers.set(decoded.id, decoded.username);

        return next();
      });
    } catch (error) {
      return next(error);
    }
  });

  io.on("connect", (socket) => {
    // console.log("New client connected:", socket.data.username);

    socket.on("send-message", async (data) => {
      try {
        const roomName = data.roomName?.trim();
        if (!roomName) return;

        const key = Number(data.key);
        const scoreIndex = Number(data.scoreIndex);

        // only update if provided + valid
        if (Number.isFinite(key)) roomKeys.set(roomName, key);
        if (Number.isFinite(scoreIndex))
          roomScoreIndex.set(roomName, scoreIndex);

        // broadcast to others (and keep payload consistent)

        // Update room keys in DB

        if (data.allScores) {
          data.allScores[Object.keys(data.allScores)[scoreIndex]] = key;

          await prisma.room.update({
            where: { roomName },
            data: {
              scores: data.allScores,
            },
          });
          socket.to(roomName).emit("receive-message", {
            key,
            scoreIndex,
            scores: data.allScores,
          });
        } else {
          const existingRoom = await prisma.room.findFirst({
            where: { roomName },
            select: { scores: true },
          });

          socket.to(roomName).emit("receive-message", {
            key,
            scoreIndex,
            scores: existingRoom.scores,
          });
        }
      } catch (err) {
        console.error("send-message handler error", err);
      }
    });

    socket.on("scroll", ({ roomName, ratio }) => {
      try {
        const r = Number(ratio);
        if (!roomName || !Number.isFinite(r)) return;
        io.to(roomName.trim()).emit("scroll", {
          ratio: Math.max(0, Math.min(1, r)),
        });
      } catch (err) {
        console.error("scroll handler error", err);
      }
    });

    socket.on("transpose-notify", ({ roomName, direction }) => {
      try {
        const trimmed = roomName?.trim();
        if (!trimmed) return;
        const dir = direction === "down" ? "down" : "up";
        io.to(trimmed).emit("transpose-notify", {
          direction: dir,
          username: socket.data?.username,
        });
      } catch (err) {
        console.error("transpose-notify handler error", err);
      }
    });

    socket.on("reset-room", ({ roomName }) => {
      try {
        const trimmed = roomName?.trim();
        if (!trimmed) return;

        io.to(trimmed).emit("scroll-reset", {
          ratio: 0,
          username: socket.data?.username,
        });
      } catch (err) {
        console.error("reset-room handler error", err);
      }
    });

    socket.on("join-room", async ({ roomName }) => {
      try {
        const trimmed = roomName?.trim();
        if (!trimmed) return;

        const existingRoom = await prisma.room.findFirst({
          where: { roomName: trimmed },
        });

        if (!existingRoom) {
          socket.emit("error", {
            message: `Room '${roomName}' does not exist`,
          });
          return;
        }

        socket.join(trimmed);
        socket.data.roomName = trimmed;
        addParticipant(trimmed, socket.data.id);
        io.to(trimmed).emit("scroll-reset", { ratio: 0 });

        // Notify others in the room about new participant
        socket.to(trimmed).emit("user-joined", {
          username: socket.data?.username,
        });

        const key = roomKeys.get(trimmed) ?? 0;
        const scoreIndex = roomScoreIndex.get(trimmed) ?? 0;

        socket.emit("receive-message", {
          key,
          scoreIndex,
          scores: existingRoom.scores,
        });

        // console.log(`User with ID: ${socket.id} joined room: ${trimmed}`);
      } catch (err) {
        console.error("join-room handler error", err);
        socket.emit("error", { message: `Error checking room existence` });
      }
    });

    socket.on("leave-room", (data) => {
      try {
        const trimmed = data?.roomName?.trim();
        if (!trimmed) return;
        socket.leave(trimmed);
        removeParticipant(trimmed, socket.data.id);
        socket.data.roomName = null;

        socket.to(trimmed).emit("user-left", {
          username: socket.data?.username,
          roomId: trimmed,
          timestamp: new Date(),
        });

        socket.emit("room-left", {
          roomId: trimmed,
          success: true,
        });
      } catch (err) {
        console.error("leave-room handler error", err);
      }
    });

    socket.on("disconnect", () => {
      try {
        const roomName = socket.data?.roomName;
        if (roomName) {
          removeParticipant(roomName, socket.data.id);
          socket.to(roomName).emit("user-left", {
            username: socket.data?.username,
            roomId: roomName,
            timestamp: new Date(),
          });
        }
        allUsers.delete(socket.data.id);
      } catch (err) {
        console.error("Disconnect handler error", err);
      }
    });
  });
};

export default initSockets;
