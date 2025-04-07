import { Request, Response } from "express";
import {
  getUserById,
  updateUserProfile,
  changeUserPassword,
  updateNotificationSettings,
  deleteUserAccount,
  updatePasswordDirectly,
  verifyCodeAndChangePassword,
  sendPasswordChangeVerificationCode,
} from "../services/userService";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import User from "../models/User";

// Lấy thông tin profile người dùng
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    console.log(`✅ [userController] Lấy profile cho userId: ${userId}`);

    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    console.log(
      `✅ [userController] Trả về profile cho user: ${user.fullName}`
    );
    res.json(user);
  } catch (error) {
    console.error("❌ [userController] Lỗi khi lấy profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Cập nhật thông tin profile
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    console.log(`✅ [userController] Cập nhật profile cho userId: ${userId}`);
    console.log(`✅ [userController] Dữ liệu cập nhật:`, req.body);

    const updatedUser = await updateUserProfile(userId, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error("❌ [userController] Lỗi khi cập nhật profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Thay đổi mật khẩu
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      currentPassword,
      newPassword,
      verificationMethod,
      verificationCode,
    } = req.body;

    if (!userId || !newPassword || !verificationMethod) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    console.log(
      `✅ [userController] Thay đổi mật khẩu cho userId: ${userId} bằng phương thức: ${verificationMethod}`
    );

    let success = false;

    switch (verificationMethod) {
      case "password":
        if (!currentPassword) {
          res.status(400).json({ message: "Current password is required" });
          return;
        }
        success = await changeUserPassword(
          userId,
          currentPassword,
          newPassword
        );
        break;

      case "email":
        if (!verificationCode) {
          res.status(400).json({ message: "Verification code is required" });
          return;
        }
        success = await verifyCodeAndChangePassword(
          userId,
          verificationCode,
          newPassword
        );
        break;

      default:
        res.status(400).json({ message: "Invalid verification method" });
        return;
    }

    if (!success) {
      res.status(400).json({
        message:
          verificationMethod === "password"
            ? "Invalid password"
            : verificationMethod === "email"
            ? "Invalid verification code"
            : "Verification failed",
      });
      return;
    }

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ [userController] Lỗi khi thay đổi mật khẩu:", error);
    res.status(500).json({ message: "Error changing password" });
  }
};

// Gửi mã xác nhận đổi mật khẩu qua email
export const sendPasswordChangeCode = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    console.log(
      `✅ [userController] Gửi mã xác nhận đổi mật khẩu cho userId: ${userId}`
    );

    const user = await getUserById(userId);
    if (!user || !user.email) {
      res.status(404).json({ message: "User not found or no email set" });
      return;
    }

    // Gọi service để gửi mã xác nhận
    const result = await sendPasswordChangeVerificationCode(user.email);

    res.json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.error("❌ [userController] Lỗi khi gửi mã xác nhận:", error);
    res.status(500).json({ message: "Error sending verification code" });
  }
};

// Cập nhật cài đặt thông báo
export const updateNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const settings = req.body;
    if (!settings || typeof settings !== "object") {
      res.status(400).json({ message: "Invalid notification settings" });
      return;
    }

    console.log(`✅ [userController] Cập nhật thông báo cho userId: ${userId}`);
    console.log(`✅ [userController] Cài đặt thông báo:`, settings);

    const updatedUser = await updateNotificationSettings(userId, settings);
    res.json(updatedUser);
  } catch (error) {
    console.error("❌ [userController] Lỗi khi cập nhật thông báo:", error);
    res.status(500).json({ message: "Error updating notifications" });
  }
};

// Xóa tài khoản
export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { password } = req.body;
    if (!password) {
      res
        .status(400)
        .json({ message: "Password is required to delete account" });
      return;
    }

    console.log(`✅ [userController] Xóa tài khoản cho userId: ${userId}`);

    // Kiểm tra mật khẩu trước khi xóa tài khoản
    // Truyền tham số includePassword=true để lấy cả mật khẩu
    const user = await getUserById(userId, true);
    if (!user || !user.password) {
      res.status(404).json({ message: "User not found or no password set" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    await deleteUserAccount(userId);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("❌ [userController] Lỗi khi xóa tài khoản:", error);
    res.status(500).json({ message: "Error deleting account" });
  }
};

// Upload avatar
export const uploadAvatar = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    console.log(`✅ [userController] Upload avatar cho userId: ${userId}`);

    // Xử lý upload avatar (sẽ cần thêm middleware multer và logic lưu file)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await updateUserProfile(userId, { avatar: avatarUrl });
    res.json({ avatarUrl, user: updatedUser });
  } catch (error) {
    console.error("❌ [userController] Lỗi khi upload avatar:", error);
    res.status(500).json({ message: "Error uploading avatar" });
  }
};

// Controller cho việc quét biên lai
export const scanReceipt = (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Here you would implement the OCR logic or call an OCR service
    // For now, we'll just return a dummy success response

    // Simulate processing time
    setTimeout(() => {
      res.status(200).json({
        success: true,
        message: "Receipt processed successfully",
        data: {
          date: new Date().toISOString().split("T")[0],
          merchant: "Sample Store",
          total: 1250000,
          items: [
            { name: "Item 1", price: 350000 },
            { name: "Item 2", price: 900000 },
          ],
        },
      });
    }, 1000);
  } catch (error) {
    console.error("Error in receipt scanning:", error);
    res.status(500).json({ message: "Error processing receipt" });
  }
};
