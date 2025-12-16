import express from "express";
import {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";

const router = express.Router();

// @route   GET /api/classes
router.get("/", getClasses);

// @route   GET /api/classes/:id
router.get("/:id", getClass);

// @route   POST /api/classes
router.post("/", createClass);

// @route   PUT /api/classes/:id
router.put("/:id", updateClass);

// @route   DELETE /api/classes/:id
router.delete("/:id", deleteClass);

export default router;