import allowedOrigins from "../config/allowedOrigins.js";

export const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  const isPreview = /^https:\/\/zhan-xin-.*\.vercel\.app$/i.test(origin || "");
  if (allowedOrigins.includes(origin) || isPreview) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.status(204).json({ message: "Preflight OK" });
    }
  }
  next();
};
