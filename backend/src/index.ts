import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import homeRoutes from "./routes/homeRoutes";
import userRoutes from "./routes/userRoutes";
import { specs, swaggerUi } from "./config/swagger"; // Thêm import này
import { initializeS3Bucket } from "./services/s3Service";

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

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://3.87.47.184:3000",
      "http://3.87.47.184",
      // Thêm domain của Swagger UI
      "http://localhost:3000/api-docs",
      "http://3.87.47.184:3000/api-docs",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);
app.use(express.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Cấu hình Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      validatorUrl: null,
      withCredentials: true,
      displayRequestDuration: true,
      filter: true,
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", homeRoutes);
app.use("/api/user", userRoutes);

// Test route
app.get("/api", (req, res) => {
  res.json({ message: "API is running..." });
});

// Add health check route before other routes
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      message: err.message || "Internal server error",
      success: false,
    });
  }
);

connectDB()
  .then(() => {
    // Khởi động server chỉ khi đã kết nối MongoDB thành công
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Server URL: http://localhost:${PORT}`);
      console.log(`Swagger Documentation: http://localhost:${PORT}/api-docs`);
    });

    // Initialize S3 Bucket
    initializeS3Bucket().catch(console.error);
  })
  .catch((error) => {
    console.error("❌ Không thể khởi động server:", error);
    process.exit(1);
  });

// Xử lý graceful shutdown
process.on("SIGTERM", () => {
  console.log("📢 Nhận tín hiệu SIGTERM - Chuẩn bị tắt server...");
  // ... existing shutdown logic ...
});

// Thêm middleware để set header CORS trước khi định nghĩa routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.1.15:3000",
      "http://3.87.47.184:3000",
      "exp://192.168.1.15:8081",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);
