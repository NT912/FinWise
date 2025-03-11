import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import homeRoutes from "./routes/homeRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

// Connect to MongoDB
connectDB();

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

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", homeRoutes);
app.use("/api/user", userRoutes);

// Test route
app.get("/api", (req, res) => {
  res.json({ message: "API is running..." });
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

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  // Listen on all network interfaces
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Server URL (Network): http://192.168.1.10:${PORT}`);
});
