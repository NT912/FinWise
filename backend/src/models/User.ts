import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password?: string;
  googleId?: string;
  facebookId?: string;
  avatar?: string;
  totalBalance: number;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  accountStatus: "active" | "deactivated";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    facebookId: { type: String },
    avatar: { type: String },
    totalBalance: { type: Number, default: 0 },
    phone: {
      type: String,
      default: null,
    },

    // ✅ Cài đặt thông báo
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },

    // ✅ Trạng thái tài khoản
    accountStatus: {
      type: String,
      enum: ["active", "deactivated"],
      default: "active",
    },
  },
  { timestamps: true } // ✅ Tự động thêm `createdAt` & `updatedAt`
);

export default mongoose.model<IUser>("User", userSchema);
