import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {
  sendResetPasswordEmail,
  generateResetToken,
} from "../services/authService";
import PasswordReset from "../models/PasswordReset";

/**
 * Lấy thông tin người dùng theo ID
 */
export const getUserById = async (userId: string): Promise<IUser | null> => {
  try {
    console.log(`🔍 [userService] Tìm user với ID: ${userId}`);

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`❌ [userService] ID không hợp lệ: ${userId}`);
      return null;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      console.log(`❌ [userService] Không tìm thấy user với ID: ${userId}`);
      return null;
    }

    console.log(`✅ [userService] Đã tìm thấy user: ${user.fullName}`);
    return user;
  } catch (error) {
    console.error(`❌ [userService] Lỗi khi tìm user:`, error);
    throw error;
  }
};

/**
 * Cập nhật thông tin người dùng
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<IUser>
): Promise<IUser | null> => {
  try {
    console.log(`🔍 [userService] Cập nhật user với ID: ${userId}`);
    console.log(`🔍 [userService] Dữ liệu cập nhật:`, profileData);

    // Loại bỏ các trường không được phép cập nhật
    const allowedUpdates = ["fullName", "email", "phone", "avatar"];
    const filteredData: any = {};

    Object.keys(profileData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredData[key] = profileData[key as keyof typeof profileData];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      console.log(
        `❌ [userService] Không tìm thấy user để cập nhật với ID: ${userId}`
      );
      return null;
    }

    console.log(`✅ [userService] Đã cập nhật user: ${updatedUser.fullName}`);
    return updatedUser;
  } catch (error) {
    console.error(`❌ [userService] Lỗi khi cập nhật user:`, error);
    throw error;
  }
};

/**
 * Thay đổi mật khẩu người dùng
 */
export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  try {
    console.log(`🔍 [userService] Thay đổi mật khẩu cho user ID: ${userId}`);

    const user = await User.findById(userId);
    if (!user || !user.password) {
      console.log(
        `❌ [userService] Không tìm thấy user hoặc user không có mật khẩu: ${userId}`
      );
      return false;
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log(
        `❌ [userService] Mật khẩu hiện tại không đúng cho user: ${userId}`
      );
      return false;
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log(
      `✅ [userService] Đã thay đổi mật khẩu cho user: ${user.fullName}`
    );
    return true;
  } catch (error) {
    console.error(`❌ [userService] Lỗi khi thay đổi mật khẩu:`, error);
    throw error;
  }
};

/**
 * Cập nhật mật khẩu trực tiếp (dùng cho FaceID)
 */
export const updatePasswordDirectly = async (
  userId: string,
  newPassword: string
): Promise<boolean> => {
  try {
    console.log(
      `🔍 [userService] Cập nhật trực tiếp mật khẩu cho user ID: ${userId}`
    );

    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ [userService] Không tìm thấy user: ${userId}`);
      return false;
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log(
      `✅ [userService] Đã cập nhật mật khẩu cho user: ${user.fullName}`
    );
    return true;
  } catch (error) {
    console.error(`❌ [userService] Lỗi khi cập nhật mật khẩu:`, error);
    throw error;
  }
};

/**
 * Gửi mã xác nhận đổi mật khẩu qua email
 */
export const sendPasswordChangeVerificationCode = async (
  email: string
): Promise<boolean> => {
  try {
    console.log(
      `🔍 [userService] Gửi mã xác nhận đổi mật khẩu cho email: ${email}`
    );

    // Sử dụng lại hàm từ authService để tạo và gửi mã xác nhận
    const resetCode = generateResetToken();

    // Xóa mã cũ nếu có
    await PasswordReset.deleteMany({ email });

    // Lưu mã mới
    await new PasswordReset({
      email,
      resetCode,
      createdAt: new Date(),
    }).save();

    // Gửi email
    await sendResetPasswordEmail(email);

    console.log(
      `✅ [userService] Đã gửi mã xác nhận đổi mật khẩu cho email: ${email}`
    );
    return true;
  } catch (error) {
    console.error(`❌ [userService] Lỗi khi gửi mã xác nhận:`, error);
    throw error;
  }
};

/**
 * Xác thực mã và đổi mật khẩu
 */
export const verifyCodeAndChangePassword = async (
  userId: string,
  verificationCode: string,
  newPassword: string
): Promise<boolean> => {
  try {
    console.log(
      `🔍 [userService] Xác thực mã và đổi mật khẩu cho user ID: ${userId}`
    );

    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.log(`❌ [userService] Không tìm thấy user hoặc email: ${userId}`);
      return false;
    }

    // Tìm mã xác nhận mới nhất
    const resetRecord = await PasswordReset.findOne({ email: user.email })
      .sort({ createdAt: -1 })
      .exec();

    if (!resetRecord) {
      console.log(
        `❌ [userService] Không tìm thấy mã xác nhận cho email: ${user.email}`
      );
      return false;
    }

    // Kiểm tra mã xác nhận
    if (resetRecord.resetCode !== verificationCode) {
      console.log(
        `❌ [userService] Mã xác nhận không khớp cho email: ${user.email}`
      );
      return false;
    }

    // Kiểm tra thời gian hết hạn (1 giờ)
    if (
      resetRecord.createdAt &&
      Date.now() - resetRecord.createdAt.getTime() > 3600000
    ) {
      console.log(
        `❌ [userService] Mã xác nhận đã hết hạn cho email: ${user.email}`
      );
      return false;
    }

    // Cập nhật mật khẩu
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Xóa mã xác nhận đã sử dụng
    await PasswordReset.deleteMany({ email: user.email });

    console.log(
      `✅ [userService] Đã đổi mật khẩu thành công cho user: ${user.fullName}`
    );
    return true;
  } catch (error) {
    console.error(
      `❌ [userService] Lỗi khi xác thực mã và đổi mật khẩu:`,
      error
    );
    throw error;
  }
};

/**
 * Bật/tắt FaceID
 */
export const toggleFaceID = async (
  userId: string,
  enable: boolean
): Promise<IUser | null> => {
  try {
    console.log(
      `🔍 [userService] ${
        enable ? "Bật" : "Tắt"
      } Face ID cho user ID: ${userId}`
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { faceIDEnabled: enable },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      console.log(
        `❌ [userService] Không tìm thấy user để cập nhật Face ID: ${userId}`
      );
      return null;
    }

    console.log(
      `✅ [userService] Đã ${enable ? "bật" : "tắt"} Face ID cho user: ${
        updatedUser.fullName
      }`
    );
    return updatedUser;
  } catch (error) {
    console.error(`❌ [userService] Lỗi khi cập nhật Face ID:`, error);
    throw error;
  }
};

/**
 * Cập nhật cài đặt thông báo
 */
export const updateNotificationSettings = async (
  userId: string,
  settings: { push?: boolean; email?: boolean; sms?: boolean }
): Promise<IUser | null> => {
  try {
    console.log(`🔍 [userService] Cập nhật thông báo cho user ID: ${userId}`);
    console.log(`🔍 [userService] Cài đặt thông báo:`, settings);

    // Lấy cài đặt hiện tại
    const user = await User.findById(userId);
    if (!user) {
      console.log(
        `❌ [userService] Không tìm thấy user để cập nhật thông báo: ${userId}`
      );
      return null;
    }

    // Cập nhật cài đặt thông báo
    const updatedSettings = {
      push:
        settings.push !== undefined ? settings.push : user.notifications?.push,
      email:
        settings.email !== undefined
          ? settings.email
          : user.notifications?.email,
      sms: settings.sms !== undefined ? settings.sms : user.notifications?.sms,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { notifications: updatedSettings },
      { new: true }
    ).select("-password");

    console.log(
      `✅ [userService] Đã cập nhật thông báo cho user: ${updatedUser?.fullName}`
    );
    return updatedUser;
  } catch (error) {
    console.error(`❌ [userService] Lỗi khi cập nhật thông báo:`, error);
    throw error;
  }
};

/**
 * Xóa tài khoản người dùng
 */
export const deleteUserAccount = async (userId: string): Promise<boolean> => {
  try {
    console.log(`🔍 [userService] Xóa tài khoản user ID: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ [userService] Không tìm thấy user để xóa: ${userId}`);
      return false;
    }

    // Xóa user
    await User.findByIdAndDelete(userId);

    console.log(`✅ [userService] Đã xóa tài khoản user: ${user.fullName}`);
    return true;
  } catch (error) {
    console.error(`❌ [userService] Lỗi khi xóa tài khoản:`, error);
    throw error;
  }
};
