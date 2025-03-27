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
  icon: string;
  color: string;
  type: "income" | "expense";
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
