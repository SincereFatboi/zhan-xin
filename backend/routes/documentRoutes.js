import { RoleType } from "@prisma/client";
import {
  createMultiPartUpload,
  uploadFilePart,
  completeMultiPartUpload,
  abortMultiPartUpload,
} from "../controllers/document/createDocument/index.js";
import { getDocument, uploadDocument } from "../controllers/document/index.js";

export const documentRoutes = (fastify, opts, done) => {
  // fastify.route({
  //   method: "PUT",
  //   url: "/create-multi-part-upload",
  //   schema: createMultiPartUpload.schema,
  //   preHandler: fastify.auth(
  //     [
  //       [
  //         fastify.verifyJWT,
  //         fastify.verifyRole([
  //           RoleType.MEMBER,
  //           RoleType.ADMIN,
  //           RoleType.SUPER_ADMIN,
  //         ]),
  //       ],
  //     ],
  //     { run: "all" }
  //   ),
  //   handler: createMultiPartUpload.handler,
  // });

  // fastify.route({
  //   method: "PUT",
  //   url: "/upload-file-part",
  //   schema: uploadFilePart.schema,
  //   preHandler: fastify.auth(
  //     [
  //       [
  //         fastify.verifyJWT,
  //         fastify.verifyRole([
  //           RoleType.MEMBER,
  //           RoleType.ADMIN,
  //           RoleType.SUPER_ADMIN,
  //         ]),
  //       ],
  //     ],
  //     { run: "all" }
  //   ),
  //   handler: uploadFilePart.handler,
  // });

  // fastify.route({
  //   method: "PUT",
  //   url: "/complete-multi-part-upload",
  //   schema: completeMultiPartUpload.schema,
  //   preHandler: fastify.auth(
  //     [
  //       [
  //         fastify.verifyJWT,
  //         fastify.verifyRole([
  //           RoleType.MEMBER,
  //           RoleType.ADMIN,
  //           RoleType.SUPER_ADMIN,
  //         ]),
  //       ],
  //     ],
  //     { run: "all" }
  //   ),
  //   handler: completeMultiPartUpload.handler,
  // });

  // fastify.route({
  //   method: "PUT",
  //   url: "/abort-multi-part-upload",
  //   schema: abortMultiPartUpload.schema,
  //   preHandler: fastify.auth(
  //     [
  //       [
  //         fastify.verifyJWT,
  //         fastify.verifyRole([
  //           RoleType.MEMBER,
  //           RoleType.ADMIN,
  //           RoleType.SUPER_ADMIN,
  //         ]),
  //       ],
  //     ],
  //     { run: "all" }
  //   ),
  //   handler: abortMultiPartUpload.handler,
  // });

  fastify.route({
    method: "GET",
    url: "/:documentKey",
    schema: getDocument.schema,
    preHandler: fastify.auth([
      fastify.verifyJWT,
      fastify.verifyRole([
        RoleType.MEMBER,
        RoleType.ADMIN,
        RoleType.SUPER_ADMIN,
      ]),
    ]),
    handler: getDocument.handler,
  });

  fastify.route({
    method: "POST",
    url: "/upload-document",
    schema: uploadDocument.schema,
    preHandler: fastify.auth(
      [
        [
          fastify.verifyJWT,
          fastify.verifyRole([
            RoleType.MEMBER,
            RoleType.ADMIN,
            RoleType.SUPER_ADMIN,
          ]),
        ],
      ],
      { run: "all" }
    ),
    handler: uploadDocument.handler,
  });

  done();
};
