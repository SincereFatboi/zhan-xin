import express from "express";
import {
  signIn,
  signOut,
  refreshToken,
  signUp,
} from "../controllers/auth/index.js";

const router = express.Router();

router.post("/sign-in", signIn);
router.post("/sign-up", signUp);
router.get("/refresh-token", refreshToken);
router.get("/sign-out", signOut);

export default router;
