import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import homeRoutes from "./routes/homeRoutes";
import userRoutes from "./routes/userRoutes";
import walletRoutes from "./routes/walletRoutes";
import transactionRoutes from "./routes/new-routes/transactionRoutes";
import categoryRoutes from "./routes/new-routes/categoryRoutes";
import { specs, swaggerUi, setupSwagger } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, "../uploads");
const avatarsDir = path.join(uploadsDir, "avatars");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Created uploads directory");
}

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir);
  console.log("Created avatars directory");
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Thêm log khi khởi động server
console.log("🚀 Khởi động FinWise Backend Server...");
console.log(`📅 Thời gian khởi động: ${new Date().toLocaleString()}`);
console.log(`🌍 Môi trường: ${process.env.NODE_ENV || "development"}`);
console.log(`🔗 API Base URL: ${process.env.API_BASE_URL}`);

// Middleware cơ bản
app.use(express.json());

// Cấu hình CORS
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://3.87.47.184:3000",
    "http://3.87.47.184",
    "http://3.0.248.48:3000",
    "http://3.0.248.48",
    "exp://192.168.1.3:8081",
    "exp://192.168.1.4:8081",
    "http://192.168.1.3:8081",
    "http://192.168.1.4:8081",
    "http://192.168.1.3:3000",
    "http://192.168.1.3:3001",
    "http://192.168.1.4:3000",
    "http://192.168.1.4:3001",
    "exp://192.168.1.10:3000",
    "http://192.168.2.2:3000",
    "http://192.168.2.2:3001",
    "http://192.168.2.2:3002",
    "exp://192.168.2.2:8081",
    "http://192.168.2.2:8081",
    "*",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

app.use(cors(corsOptions));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Cấu hình Swagger
setupSwagger(app);

// Public routes - không yêu cầu xác thực
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  });
});

app.get("/api", (req, res) => {
  res.json({ message: "API is running..." });
});

// Protected routes - yêu cầu xác thực
app.use("/api/auth", authRoutes);
app.use("/api", homeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);

// Error handling middleware
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Server URL: http://192.168.2.2:${PORT}`);
      console.log(`Local URL: http://127.0.0.1:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Không thể khởi động server:", error);
    process.exit(1);
  });

// Xử lý graceful shutdown
process.on("SIGTERM", () => {
  console.log("📢 Nhận tín hiệu SIGTERM - Chuẩn bị tắt server...");
});
