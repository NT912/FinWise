import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client, { S3_BUCKET_NAME } from "../config/s3Config";
import fs from "fs";
import path from "path";

// Upload file lên S3
export const uploadFileToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  try {
    console.log(`🔍 [s3Service] Đang upload file ${fileName} lên S3`);

    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    console.log(`✅ [s3Service] Upload file thành công: ${key}`);

    return key;
  } catch (error) {
    console.error("❌ [s3Service] Lỗi khi upload file:", error);
    throw new Error("Không thể upload file");
  }
};

// Lấy URL có chữ ký để truy cập file
export const getSignedFileUrl = async (
  key: string,
  expiresIn = 3600
): Promise<string> => {
  try {
    console.log(`🔍 [s3Service] Tạo signed URL cho file: ${key}`);

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("❌ [s3Service] Lỗi khi tạo signed URL:", error);
    throw new Error("Không thể tạo URL truy cập file");
  }
};

// Xóa file từ S3
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  try {
    console.log(`🔍 [s3Service] Xóa file: ${key}`);

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`✅ [s3Service] Xóa file thành công: ${key}`);
  } catch (error) {
    console.error("❌ [s3Service] Lỗi khi xóa file:", error);
    throw new Error("Không thể xóa file");
  }
};

// Upload file từ đường dẫn local lên S3
export const uploadLocalFileToS3 = async (
  filePath: string,
  contentType: string
): Promise<string> => {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    return await uploadFileToS3(fileContent, fileName, contentType);
  } catch (error) {
    console.error("❌ [s3Service] Lỗi khi upload file local:", error);
    throw new Error("Không thể upload file từ local");
  }
};

// Liệt kê các file trong thư mục
export const listFilesInFolder = async (prefix: string): Promise<string[]> => {
  try {
    console.log(`🔍 [s3Service] Liệt kê files trong thư mục: ${prefix}`);

    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    const files = response.Contents?.map((item) => item.Key || "") || [];

    return files;
  } catch (error) {
    console.error("❌ [s3Service] Lỗi khi liệt kê files:", error);
    throw new Error("Không thể liệt kê files");
  }
};

// Kiểm tra và tạo bucket nếu chưa tồn tại
export const initializeS3Bucket = async () => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      MaxKeys: 1,
    });
    await s3Client.send(command);
    console.log(`✅ [s3Service] Bucket ${S3_BUCKET_NAME} đã tồn tại`);
  } catch (error: any) {
    if (error.name === "NoSuchBucket") {
      console.log(`🔍 [s3Service] Tạo bucket mới: ${S3_BUCKET_NAME}`);
      const createCommand = new CreateBucketCommand({
        Bucket: S3_BUCKET_NAME,
      });
      await s3Client.send(createCommand);
    } else {
      throw error;
    }
  }
};
