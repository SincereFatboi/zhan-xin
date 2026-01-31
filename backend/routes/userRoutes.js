import express from "express";
import {
  deleteUsers,
  getAllUsers,
  updateUser,
} from "../controllers/users/index.js";

const router = express.Router();

router.get("/get-all-users", getAllUsers);
router.put("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUsers);

export default router;
