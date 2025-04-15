import mongoose from "mongoose";

const savingGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SavingGoal", savingGoalSchema);
