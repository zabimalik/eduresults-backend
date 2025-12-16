import express from "express";
import {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  toggleNoticeStatus,
  deleteNotice,
  getActiveNotices,
  getNoticesByPriority,
  getNoticeStats,
} from "../controllers/noticeController.js";

const router = express.Router();

// @route   GET /api/notices/stats
router.get("/stats", getNoticeStats);

// @route   GET /api/notices/active
router.get("/active", getActiveNotices);

// @route   GET /api/notices/priority/:priority
router.get("/priority/:priority", getNoticesByPriority);

// @route   GET /api/notices
router.get("/", getNotices);

// @route   GET /api/notices/:id
router.get("/:id", getNotice);

// @route   POST /api/notices
router.post("/", createNotice);

// @route   PUT /api/notices/:id
router.put("/:id", updateNotice);

// @route   PATCH /api/notices/:id/toggle
router.patch("/:id/toggle", toggleNoticeStatus);

// @route   DELETE /api/notices/:id
router.delete("/:id", deleteNotice);

export default router;