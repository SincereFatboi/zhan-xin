import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJWT from "@fastify/jwt";
import fastifyRoutes from "@fastify/routes";
import fastifyCookie from "@fastify/cookie";
import fastifyAuth from "@fastify/auth";
import fastifyMultipart from "@fastify/multipart";
import fastifyWebsocket from "@fastify/websocket";
import { userRoutes, documentRoutes, roomRoutes } from "./routes/index.js";
import { verifyJWT, verifyRole } from "./middlewares/index.js";
import HTTPError from "./utils/http-error.js";

const fastify = Fastify({
  logger: true,
});

// CORS
await fastify.register(cors, {
  methods: ["GET", "PUT", "PATCH", "DELETE", "POST"],
  allowedHeaders: [
    "Content-Length",
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
  ],
  origin: true,
  credentials: true,
});

//Middlewares
fastify.decorate("verifyJWT", verifyJWT).decorate("verifyRole", verifyRole);

// JWT
await fastify.register(fastifyJWT, {
  secret: process.env.JWT_SECRET,
  cookie: {
    cookieName: "jwt",
    sign: true,
  },
});

// Cookie
await fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
  sign: true,
});

// Websocket
await fastify.register(fastifyWebsocket, {
  server: fastify.server,
  options: { maxPayload: 1048576 },
});
export const rooms = {};

// Multipart
await fastify.register(fastifyMultipart, {
  addToBody: true,
  limits: {
    fileSize: 6 * 1024 * 1024,
  },
});

// Auth
await fastify.register(fastifyAuth, { defaultRelation: "and" });

// Routes
await fastify.register(fastifyRoutes);
await fastify.register(userRoutes, { prefix: "/api/user" });
await fastify.register(documentRoutes, { prefix: "/api/document" });
await fastify.register(roomRoutes, { prefix: "/api/room" });

// Error Handler
fastify.setErrorHandler((err, req, rep) => {
  console.log("🤡 ~ fastify.setErrorHandler:", err);

  if (err instanceof HTTPError) {
    return rep.code(err.statusCode).send({
      ok: false,
      statusCode: err.statusCode,
      message: err.message,
    });
  } else if (err.statusCode === 400) {
    return rep.code(err.statusCode).send({
      ok: false,
      statusCode: err.statusCode,
      message: "Bad Request",
    });
  } else {
    return rep.code(500).send({
      ok: false,
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 5000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
