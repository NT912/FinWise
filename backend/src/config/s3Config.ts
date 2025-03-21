import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error("❌ Thiếu thông tin xác thực AWS!");
  process.exit(1);
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const S3_BUCKET_NAME =
  process.env.AWS_S3_BUCKET_NAME || "finwise-app-storage";

// Kiểm tra kết nối
const checkS3Connection = async () => {
  try {
    await s3Client.config.credentials();
    console.log("✅ Kết nối AWS S3 thành công!");
    // Kiểm tra thông tin AWS S3
    console.log("AWS Region:", process.env.AWS_REGION);
    console.log("S3 Bucket:", process.env.AWS_S3_BUCKET_NAME);
  } catch (error) {
    console.error("❌ Lỗi kết nối AWS S3:", error);
    process.exit(1);
  }
};

checkS3Connection();

export default s3Client;
