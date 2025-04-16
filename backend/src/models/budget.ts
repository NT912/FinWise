import mongoose, { Document, Schema } from "mongoose";

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  totalBudget: number;
  month: number;
  year: number;
  createdAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalBudget: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IBudget>("Budget", BudgetSchema);
