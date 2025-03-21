import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Biến để theo dõi trạng thái kết nối
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB đã được kết nối trước đó");
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    console.log("Đang kết nối tới MongoDB...");
    const conn = await mongoose.connect(mongoURI);

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Thêm kiểm tra null và sử dụng name trực tiếp từ connection
    const dbName = conn.connection.name || "unknown";
    console.log(`Database Name: ${dbName}`);
    console.log(`Connection State: ${conn.connection.readyState}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.error("Chi tiết kết nối:");
    console.error("- URI:", process.env.MONGODB_URI?.split("@")[1]);
    process.exit(1);
  }
};

export default connectDB;
