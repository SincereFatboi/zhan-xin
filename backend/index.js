import express from "express";
import http from "http";
import cors from "cors";
import "dotenv/config";
import { Server as SocketIO } from "socket.io";

import scoresRoutes from "./routes/scoresRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import corsOptions from "./config/corsOptions.js";
import { credentials } from "./middlewares/credentials.js";
import { parseHtmlFile } from "./files/processor/processor.js";
import cookieParser from "cookie-parser";
import createError from "http-errors";
import { PrismaClient } from "@prisma/client";
import initSockets from "./sockets/index.js";
import { verifyJWT } from "./middlewares/verifyJWT.js";
import { verifyRole } from "./middlewares/verifyRole.js";
import { RoleType } from "@prisma/client";

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: corsOptions,
});

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
const prisma = new PrismaClient();

app.get("/", (req, res) => {
  return res.status(200).json({ message: "展心 is working!" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/scores", verifyJWT, scoresRoutes);
app.use("/api/rooms", verifyJWT, roomRoutes);
app.use(
  "/api/users",
  verifyJWT,
  verifyRole([RoleType.SUPER_ADMIN]),
  userRoutes,
);

// Sockets
initSockets(io, prisma);

// parseHtmlFile();

app.use((req, res, next) => {
  return next(createError(404, "Could not find this route"));
});

app.use((err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  return res
    .status(err.code || 500)
    .json({ message: err.message || "An unknown error occured" });
});

const port = process.env.PORT || 5000;
server.listen(port);

console.log(`🚀 ~ Server is running on port ${port}!`);
