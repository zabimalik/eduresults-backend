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
  bulkCreateResults,
  getStudentResultSummary,
  deleteAllResults,
  deleteBulkResults,
} from "../controllers/resultController.js";


import {
  validateResultInput,
  validateResultUpdate,
  validateObjectId
} from "../middleware/validation.js";

const router = express.Router();

// @route   GET /api/results/stats
router.get("/stats", getResultStats);

// @route   POST /api/results/bulk
router.post("/bulk", bulkCreateResults);

// @route   POST /api/results/bulk-delete
router.post("/bulk-delete", deleteBulkResults);

// @route   GET /api/results/student/:studentId/summary
router.get("/student/:studentId/summary", validateObjectId('studentId'), getStudentResultSummary);

// @route   GET /api/results/student/:studentId
router.get("/student/:studentId", validateObjectId('studentId'), getResultsByStudent);

// @route   GET /api/results/class/:classId
router.get("/class/:classId", validateObjectId('classId'), getResultsByClass);

// @route   GET /api/results/subject/:subjectId
router.get("/subject/:subjectId", validateObjectId('subjectId'), getResultsBySubject);

// @route   DELETE /api/results/all
router.delete("/all", deleteAllResults);

// @route   GET /api/results
router.get("/", getResults);

// @route   GET /api/results/:id
router.get("/:id", validateObjectId('id'), getResult);

// @route   POST /api/results
router.post("/", validateResultInput, createResult);

// @route   PUT /api/results/:id
router.put("/:id", validateObjectId('id'), validateResultUpdate, updateResult);

// @route   DELETE /api/results/:id
router.delete("/:id", validateObjectId('id'), deleteResult);

export default router;