import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  title: string;
  amount: number;
  date: Date;
  category: mongoose.Types.ObjectId;
  type: "income" | "expense";
  note?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề giao dịch là bắt buộc"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Số tiền giao dịch là bắt buộc"],
      min: [0, "Số tiền phải lớn hơn 0"],
    },
    date: {
      type: Date,
      required: [true, "Ngày giao dịch là bắt buộc"],
      default: Date.now,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Danh mục là bắt buộc"],
    },
    type: {
      type: String,
      required: [true, "Loại giao dịch là bắt buộc"],
      enum: ["income", "expense"],
    },
    note: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID là bắt buộc"],
    },
  },
  { timestamps: true }
);

// Index để tối ưu truy vấn
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, type: 1 });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
