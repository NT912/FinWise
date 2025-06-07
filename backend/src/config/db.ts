const mongoose = require("mongoose");
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ MongoDB đã được kết nối trước đó");
    return;
  }

  const mongoURI = "mongodb+srv://tt912002:truong912002@finwise.fjrw7.mongodb.net/finance_manager_db?retryWrites=true&w=majority";

  try {
    console.log("🔌 Đang kết nối tới MongoDB...");
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}`);
    console.log(`📶 Connection State: ${conn.connection.readyState}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
