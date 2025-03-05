import { bucket } from "../config/firebase";
import { format } from "util";
import User from "../models/User";
import { v4 as uuidv4 } from "uuid";

export const uploadAvatarToFirebase = async (
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject("No file provided");
    }

    const fileName = `avatars/${uuidv4()}_${file.originalname}`;
    const fileRef = bucket.file(fileName);

    const blobStream = fileRef.createWriteStream({
      metadata: { contentType: file.mimetype },
    });

    blobStream.on("error", (error) => reject(error));

    blobStream.on("finish", async () => {
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${fileName}`
      );
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

export const updateUserAvatar = async (email: string, avatarUrl: string) => {
  const updatedUser = await User.findOneAndUpdate(
    { email },
    { avatar: avatarUrl },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};
