import { RoleType } from "@prisma/client";
import {
  signUp,
  auth,
  getAllUsers,
  refreshToken,
  signOut,
  getUser,
  me,
} from "../controllers/user/index.js";

export const userRoutes = (fastify, opts, done) => {
  fastify.route({
    method: "POST",
    url: "/sign-up",
    schema: signUp.schema,
    handler: signUp.handler,
  });

  fastify.route({
    method: "POST",
    url: "/auth",
    schema: auth.schema,
    handler: auth.handler,
  });

  fastify.route({
    method: "GET",
    url: "/refresh-token",
    schema: refreshToken.schema,
    handler: refreshToken.handler,
  });

  fastify.route({
    method: "GET",
    url: "/sign-out",
    schema: signOut.schema,
    handler: signOut.handler,
  });

  //   fastify.addHook("preHandler", verifyJWT);

  fastify.route({
    method: "GET",
    url: "/all-users",
    schema: getAllUsers.schema,
    preHandler: fastify.auth([
      [
        fastify.verifyJWT,
        () => fastify.verifyRole([RoleType.SUPER_ADMIN, RoleType.ADMIN]),
      ],
    ]),
    handler: getAllUsers.handler,
  });

  fastify.route({
    method: "GET",
    url: "/:userID",
    schema: getUser.schema,
    preHandler: fastify.auth([
      [
        fastify.verifyJWT,
        fastify.verifyRole([RoleType.SUPER_ADMIN, RoleType.ADMIN]),
      ],
    ]),
    handler: getUser.handler,
  });

  fastify.route({
    method: "GET",
    url: "/me",
    schema: me.schema,
    preHandler: fastify.auth([
      [
        fastify.verifyJWT,
        () => fastify.verifyRole([RoleType.SUPER_ADMIN, RoleType.ADMIN]),
      ],
    ]),
    handler: me.handler,
  });

  done();
};
