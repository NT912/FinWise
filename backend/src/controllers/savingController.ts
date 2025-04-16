import { Request, Response } from "express";
import Saving from "../models/Saving";
import { getUserIdFromToken } from "../utils/auth";

export const createSavingGoal = async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromToken(req);
    const { goalName, targetAmount, month, year } = req.body;

    const saving = new Saving({
      userId,
      goalName,
      targetAmount,
      currentAmount: 0,
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
    });

    await saving.save();

    res.status(201).json({
      success: true,
      data: saving,
    });
  } catch (error) {
    console.error("Error creating saving goal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create saving goal",
    });
  }
};

export const getSavingGoals = async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromToken(req);
    const savingGoals = await Saving.find({ userId });

    res.status(200).json({
      success: true,
      data: savingGoals,
    });
  } catch (error) {
    console.error("Error getting saving goals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get saving goals",
    });
  }
};

export const updateSavingGoal = async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromToken(req);
    const { goalId } = req.params;
    const { currentAmount, targetAmount } = req.body;

    const updateData: any = {};
    if (currentAmount !== undefined) updateData.currentAmount = currentAmount;
    if (targetAmount !== undefined) updateData.targetAmount = targetAmount;

    const saving = await Saving.findOneAndUpdate(
      { _id: goalId, userId },
      updateData,
      { new: true }
    );

    if (!saving) {
      return res.status(404).json({
        success: false,
        error: "Saving goal not found",
      });
    }

    res.status(200).json({
      success: true,
      data: saving,
    });
  } catch (error) {
    console.error("Error updating saving goal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update saving goal",
    });
  }
};

export const getSavingsSummary = async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromToken(req);
    const { period } = req.query;

    // Get all saving goals for the user
    const savingGoals = await Saving.find({ userId });

    // Calculate total savings
    const totalSavings = savingGoals.reduce(
      (sum, goal) => sum + goal.currentAmount,
      0
    );

    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Find target amount for current month
    const currentGoal = savingGoals.find(
      (goal) => goal.month === currentMonth && goal.year === currentYear
    );
    const targetAmount = currentGoal?.targetAmount || 0;

    // Generate monthly data for the last 6 months
    const monthlyData = {
      labels: [] as string[],
      data: [] as number[],
    };

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString("default", { month: "short" });
      monthlyData.labels.push(monthName);
      monthlyData.data.push(0); // Default to 0 if no data
    }

    // If there are saving goals, update the data
    if (savingGoals.length > 0) {
      savingGoals.forEach((goal) => {
        const goalDate = new Date(goal.createdAt);
        const monthName = goalDate.toLocaleString("default", {
          month: "short",
        });
        const monthIndex = monthlyData.labels.indexOf(monthName);
        if (monthIndex !== -1) {
          monthlyData.data[monthIndex] += goal.currentAmount;
        }
      });
    }

    // Generate category data
    const categories = savingGoals.map((goal) => ({
      id: goal._id,
      name: goal.goalName,
      totalAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
    }));

    // Calculate progress percentage
    const progress =
      targetAmount > 0 ? Math.min((totalSavings / targetAmount) * 100, 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSavings,
        targetAmount,
        progress,
        categories,
        monthlyData,
      },
    });
  } catch (error) {
    console.error("Error getting savings summary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get savings summary",
    });
  }
};
