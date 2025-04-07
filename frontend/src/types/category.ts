import { IconName } from "../types";

export interface Category {
  _id: string;
  name: string;
  icon: IconName;
  color: string;
  type: "expense" | "income";
  budget?: number;
  rules?: {
    keyword: string;
    isEnabled: boolean;
  }[];
  userId: string;
  isDefault?: boolean;
  transactionCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isAddButton?: boolean;
}
