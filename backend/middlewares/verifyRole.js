import HTTPError from "../utils/http-error.js";
import { RoleType } from "@prisma/client";

export const verifyRole = (role) => {
  return (req, res, done) => {
    if (!req?.user?.role) {
      throw new HTTPError("Unauthorized", 401);
    }

    if (
      Object.values(RoleType).includes(req.user.role) &&
      role.includes(req.user.role)
    ) {
      done();
    } else {
      throw new HTTPError("Forbidden", 403);
    }
  };
};
