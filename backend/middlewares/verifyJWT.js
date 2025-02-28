import HTTPError from "../utils/http-error.js";

export const verifyJWT = async (req, rep) => {
  const authHeader =
    req.headers["authorization"] ||
    req.headers["Authorization"] ||
    `Bearer ${req.headers["sec-websocket-protocol"]}`;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    await req.jwtVerify(token);
  } catch (err) {
    throw new HTTPError("Forbidden", 403);
  } finally {
    // console.log("👀", req.user); // to access information in token;
    // done();
    return;
  }
};
