import { rooms } from "../../server.js";
import { PrismaClient } from "@prisma/client";
import HTTPError from "../../utils/http-error.js";

export const getRoom = {
  schema: {
    params: {
      type: "object",
      properties: {
        roomName: {
          type: "string",
        },
      },
      required: ["roomName"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          ok: { type: "boolean" },
        },
      },
    },
  },
  handler: async (connection, req) => {
    try {
      const prisma = new PrismaClient();
      await prisma.$transaction(async (trx) => {});
      const { roomName } = req.params;

      const existingRoomName = await prisma.room.findFirst({
        where: {
          roomName,
        },
      });
      console.log("🚀 ~ handler: ~ existingRoomName:", existingRoomName);

      // On connect
      if (existingRoomName?.roomName) {
        if (!rooms[existingRoomName.roomName]) {
          rooms[existingRoomName.roomName] = [];
        }

        console.log(
          "🚀 ~ handler: ~ existingRoomName.clients.includes(req.user.id):",
          existingRoomName.clients.includes(req.user.id),
          req.user.id
        );
        if (
          existingRoomName.clients.includes(req.user.id) &&
          !rooms[existingRoomName.roomName].includes(connection)
        ) {
          connection.id = req.user.id; // Client connected with this ID
          rooms[existingRoomName.roomName].push(connection);
        } else {
          throw new HTTPError("Forbidden", 403);
        }
      } else {
        throw new HTTPError("Room does not exist", 404);
      }

      // Set up listener
      connection.send(`Client connected with ID: ${connection.id}`);
      connection.on("message", (data, isBinary) => {
        const { message, action } = JSON.parse(data);
        const text = isBinary ? message : message.toString();

        rooms[existingRoomName.roomName].forEach((client) => {
          client.send(text);
        });
      });
    } catch (err) {
      throw err;
    }
  },
};
