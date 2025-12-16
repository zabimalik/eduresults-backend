import express from "express";
import {
  getResults,
  getResult,
  createResult,
  updateResult,
  deleteResult,
  getResultsByStudent,
  getResultsByClass,
  getResultsBySubject,
  getResultStats,
} from "../controllers/resultController.js";

const router = express.Router();

// @route   GET /api/results/stats
router.get("/stats", getResultStats);

// @route   GET /api/results/student/:studentId
router.get("/student/:studentId", getResultsByStudent);

// @route   GET /api/results/class/:classId
router.get("/class/:classId", getResultsByClass);

// @route   GET /api/results/subject/:subjectId
router.get("/subject/:subjectId", getResultsBySubject);

// @route   GET /api/results
router.get("/", getResults);

// @route   GET /api/results/:id
router.get("/:id", getResult);

// @route   POST /api/results
router.post("/", createResult);

// @route   PUT /api/results/:id
router.put("/:id", updateResult);

// @route   DELETE /api/results/:id
router.delete("/:id", deleteResult);

export default router;