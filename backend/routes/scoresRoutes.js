import express from "express";
import {
  getAllScores,
  uploadScores,
  getScore,
  deleteScores,
  convert,
} from "../controllers/scores/index.js";

const router = express.Router();

router.get("/get-all-scores", getAllScores);
router.get("/upload-score", uploadScores);
router.get("/get-score", getScore);
router.delete("/delete-score/:scoreName", deleteScores);
router.post("/convert", convert);

export default router;
