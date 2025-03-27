import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
  user: Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create a compound index on name and user to ensure uniqueness per user
categorySchema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.model<ICategory>("Category", categorySchema);
