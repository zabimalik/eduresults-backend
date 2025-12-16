import express from "express";
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";

const router = express.Router();

// @route   GET /api/subjects
router.get("/", getSubjects);

// @route   GET /api/subjects/:id
router.get("/:id", getSubject);

// @route   POST /api/subjects
router.post("/", createSubject);

// @route   PUT /api/subjects/:id
router.put("/:id", updateSubject);

// @route   DELETE /api/subjects/:id
router.delete("/:id", deleteSubject);

export default router;