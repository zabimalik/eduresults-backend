import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import classRoutes from "./routes/classRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import combinationRoutes from "./routes/combinationRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'https://eduresults-hub-tawny.vercel.app','https://eduresults-hub-tawny.vercel.app/', 'http://localhost:3000', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://localhost:8080', 'http://127.0.0.1:8080']
    : process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Routes
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/combinations", combinationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/notices", noticeRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduResults Hub API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API documentation route
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduResults Hub API",
    version: "1.0.0",
    endpoints: {
      classes: "/api/classes",
      subjects: "/api/subjects", 
      combinations: "/api/combinations",
      students: "/api/students",
      results: "/api/results",
      notices: "/api/notices",
      health: "/api/health"
    },
    documentation: {
      results: {
        "GET /api/results": "Get all results with filtering",
        "GET /api/results/:id": "Get single result",
        "POST /api/results": "Create new result",
        "PUT /api/results/:id": "Update result",
        "DELETE /api/results/:id": "Delete result",
        "GET /api/results/stats": "Get result statistics",
        "POST /api/results/bulk": "Bulk create results",
        "GET /api/results/student/:id": "Get results by student",
        "GET /api/results/student/:id/summary": "Get student result summary",
        "GET /api/results/class/:id": "Get results by class",
        "GET /api/results/subject/:id": "Get results by subject"
      }
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 EduResults Hub API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
});
