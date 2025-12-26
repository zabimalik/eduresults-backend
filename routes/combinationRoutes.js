import express from "express";
import {
  getCombinations,
  getCombination,
  createCombination,
  createBulkCombinations,
  updateCombination,
  toggleCombination,
  deleteCombination,
  getCombinationsByClass,
  getCombinationsBySubject,
} from "../controllers/combinationController.js";

const router = express.Router();

// @route   GET /api/combinations
router.get("/", getCombinations);

// @route   GET /api/combinations/class/:classId
router.get("/class/:classId", getCombinationsByClass);

// @route   GET /api/combinations/subject/:subjectId
router.get("/subject/:subjectId", getCombinationsBySubject);

// @route   GET /api/combinations/:id
router.get("/:id", getCombination);

// @route   POST /api/combinations/bulk
router.post("/bulk", createBulkCombinations);

// @route   POST /api/combinations
router.post("/", createCombination);

// @route   PUT /api/combinations/:id
router.put("/:id", updateCombination);

// @route   PATCH /api/combinations/:id/toggle
router.patch("/:id/toggle", toggleCombination);

// @route   DELETE /api/combinations/:id
router.delete("/:id", deleteCombination);

export default router;