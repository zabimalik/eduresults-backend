import express from "express";
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  toggleStudentStatus,
  deleteStudent,
  getStudentsByClass,
  getStudentsByYear,
  getStudentStats,
} from "../controllers/studentController.js";

const router = express.Router();

// @route   GET /api/students/stats
router.get("/stats", getStudentStats);

// @route   GET /api/students/class/:classId
router.get("/class/:classId", getStudentsByClass);

// @route   GET /api/students/year/:academicYear
router.get("/year/:academicYear", getStudentsByYear);

// @route   GET /api/students
router.get("/", getStudents);

// @route   GET /api/students/:id
router.get("/:id", getStudent);

// @route   POST /api/students
router.post("/", createStudent);

// @route   PUT /api/students/:id
router.put("/:id", updateStudent);

// @route   PATCH /api/students/:id/toggle
router.patch("/:id/toggle", toggleStudentStatus);

// @route   DELETE /api/students/:id
router.delete("/:id", deleteStudent);

export default router;