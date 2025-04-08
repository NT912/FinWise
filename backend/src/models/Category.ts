import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  icon: string;
  color: string;
  type: "expense" | "income";
  budget?: number;
  rules?: {
    keywords: string[];
    amount?: {
      min?: number;
      max?: number;
    };
  }[];
  isDefault: boolean;
  userId: string;
  transactionCount?: number;
  transactions?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["expense", "income"],
      required: true,
    },
    budget: {
      type: Number,
      default: 0,
    },
    rules: [
      {
        keywords: [
          {
            type: String,
            trim: true,
          },
        ],
        amount: {
          min: Number,
          max: Number,
        },
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      required: true,
    },
    transactionCount: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create a compound index on name and user to ensure uniqueness per user
CategorySchema.index({ name: 1, userId: 1 }, { unique: true });

export default mongoose.model<ICategory>("Category", CategorySchema);
