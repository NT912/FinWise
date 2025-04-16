import mongoose, { Schema, Document } from "mongoose";

export interface ISavings extends Document {
  userId: mongoose.Types.ObjectId;
  totalBudget: number;
  monthlyBudgets: Array<{
    year: number;
    month: number;
    amount: number;
  }>;
  savingGoals: Array<{
    _id?: mongoose.Types.ObjectId;
    goalName: string;
    targetAmount: number;
    currentAmount: number;
    createdAt: Date;
  }>;
  savingAmount: number; // Số tiền đã tiết kiệm
  targetSavingAmount: number; // Mục tiêu tiết kiệm
  createdAt: Date;
  updatedAt: Date;
}

const SavingsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    totalBudget: {
      type: Number,
      required: true,
      default: 20000000, // Default 20M VND
    },
    monthlyBudgets: [
      {
        year: {
          type: Number,
          required: true,
        },
        month: {
          type: Number,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        _id: false, // Không tạo _id cho mỗi subdocument
      },
    ],
    savingGoals: [
      {
        goalName: {
          type: String,
          required: true,
        },
        targetAmount: {
          type: Number,
          required: true,
        },
        currentAmount: {
          type: Number,
          required: true,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    savingAmount: {
      type: Number,
      default: 0,
    },
    targetSavingAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure each user has only one savings document
SavingsSchema.index({ userId: 1 }, { unique: true });

// Đảm bảo chỉ có một cặp year-month duy nhất
SavingsSchema.index(
  { "monthlyBudgets.year": 1, "monthlyBudgets.month": 1 },
  { unique: true }
);

export default mongoose.model<ISavings>("Savings", SavingsSchema);
