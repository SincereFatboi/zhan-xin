import { RoleType } from "@prisma/client";
import { getRoom, createRoom } from "../controllers/room/index.js";

export const roomRoutes = (fastify, opts, done) => {
  fastify.addHook(
    "preHandler",
    fastify.auth([
      fastify.verifyJWT,

      fastify.verifyRole([
        RoleType.MEMBER,
        RoleType.ADMIN,
        RoleType.SUPER_ADMIN,
      ]),
    ])
  );

  fastify.route({
    method: "POST",
    url: "",
    // preHandler: fastify.auth([
    //   fastify.verifyJWT,
    //   fastify.verifyRole([
    //     RoleType.MEMBER,
    //     RoleType.ADMIN,
    //     RoleType.SUPER_ADMIN,
    //   ]),
    // ]),
    schema: createRoom.schema,
    handler: createRoom.handler,
  });

  fastify.route({
    method: "GET",
    url: "/:roomName",
    websocket: true,
    // preHandler: fastify.auth([
    //   [
    //     fastify.verifyJWT,
    //     () => fastify.verifyRole([RoleType.SUPER_ADMIN, RoleType.ADMIN]),
    //   ],
    // ]),
    schema: getRoom.schema,
    handler: getRoom.handler,
  });

  done();
};
