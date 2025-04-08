import { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  phone?: string; // Thêm trường phone
  notifications?: {
    push: boolean;
    email: boolean;
    budgetAlerts: boolean;
    goalAlerts: boolean;
    transactionAlerts?: boolean; // Để tương thích ngược
    billReminders?: boolean; // Để tương thích ngược
  };
  // Thêm các trường khác nếu cần
}

export interface Category {
  _id: string;
  name: string;
  icon: IconName;
  color: string;
  type: "expense" | "income";
  isDefault?: boolean;
  budget?: number;
  rules?: {
    keyword: string;
    isEnabled: boolean;
  }[];
  transactionCount?: number;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  isAddButton?: boolean; // Trường để đánh dấu nút thêm mới
}

export interface Transaction {
  _id: string;
  amount: number;
  type: "expense" | "income";
  category: Category;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  category: Category;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rule {
  _id: string;
  category: Category;
  keyword: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: "budget" | "rule" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Settings {
  currency: string;
  language: string;
  theme: "light" | "dark";
  notifications: {
    budget: boolean;
    rule: boolean;
    system: boolean;
  };
}
