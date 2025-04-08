export type IconName =
  | "home-outline"
  | "stats-chart-outline"
  | "card-outline"
  | "person-outline"
  | "settings-outline"
  | "wallet-outline"
  | "cash-outline"
  | "add-outline"
  | "remove-outline"
  | "restaurant-outline"
  | "bus-outline"
  | "medical-outline"
  | "basket-outline"
  | "gift-outline"
  | "ticket-outline"
  | "trophy-outline"
  | "trending-up-outline"
  | "analytics-outline"
  | "cart-outline"
  | "airplane-outline"
  | "bag-outline"
  | "barbell-outline"
  | "bed-outline"
  | "bonfire-outline"
  | "book-outline"
  | "briefcase-outline"
  | "build-outline"
  | "cafe-outline"
  | "car-outline"
  | "cut-outline"
  | "film-outline"
  | "fitness-outline"
  | "flash-outline"
  | "flower-outline"
  | "game-controller-outline"
  | "happy-outline"
  | "heart-outline"
  | "laptop-outline"
  | "list-outline"
  | "people-outline"
  | "pizza-outline"
  | "pricetag-outline"
  | "school-outline";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  phone?: string;
  totalBalance?: number;
  notifications?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  accountStatus?: "active" | "deactivated";
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  _id: string;
  title: string;
  amount: number;
  date: string;
  type: "expense" | "income";
  category: {
    _id: string;
    name: string;
    icon: IconName;
    color: string;
  };
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}
