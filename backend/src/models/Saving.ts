import mongoose, { Document, Schema } from "mongoose";

export interface ISaving extends Document {
  userId: mongoose.Types.ObjectId;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: Date;
}

const SavingSchema = new Schema<ISaving>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goalName: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ISaving>("Saving", SavingSchema);
