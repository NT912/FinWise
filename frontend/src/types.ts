export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  faceIDEnabled?: boolean;
  notifications?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  // Thêm các trường khác nếu cần
}

export interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  // Thêm các trường khác nếu cần
}
