import express from "express";
import {
  createRoom,
  getAllRooms,
  deleteRooms,
  updateRoom,
} from "../controllers/rooms/index.js";

const router = express.Router();

router.post("/create-room", createRoom);
router.get("/get-all-rooms", getAllRooms);
router.put("/update-room/:roomName", updateRoom);
router.delete("/delete-room/:roomName", deleteRooms);
export default router;
