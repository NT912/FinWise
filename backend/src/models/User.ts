import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    facebookId: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
