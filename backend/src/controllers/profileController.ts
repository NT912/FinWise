import { Request, Response } from "express";
import {
  uploadAvatarToFirebase,
  updateUserAvatar,
} from "../services/profileService";

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { email, fullName, phone } = req.body;
    let avatarUrl = req.body.avatar;

    if (req.file) {
      avatarUrl = await uploadAvatarToFirebase(req.file);
    }

    const updatedUser = await updateUserAvatar(email, avatarUrl);

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};
