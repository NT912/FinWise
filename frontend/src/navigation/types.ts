import { NavigatorScreenParams } from "@react-navigation/native";
import Wallet from "../screens/Wallet/WalletScreen";
import { User } from "../types";
import { Budget } from "../services/budgetService";

export type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Budget: undefined;
  Profile: undefined;
};

export type BudgetStackParamList = {
  BudgetMain: undefined;
  CreateBudget: undefined;
  EditBudget: {
    budget: {
      _id: string;
      name: string;
      amount: number;
      startDate: string;
      endDate: string;
      categories: string[];
      walletId: string;
    };
  };
  SelectCategory: {
    type: "expense" | "income" | "debt_loan";
    selectedCategoryId?: string;
    listenerId?: string;
    onSelectCategory?: (category: any) => void;
  };
  SelectWallet: {
    selectedWalletId?: string;
    onSelectWallet?: (wallet: any) => void;
  };
};

export type RootStackParamList = {
  // Auth Screens
  Launch: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  SecurityPin: { email: string };
  ResetPassword: { email: string; resetCode: string };

  // Main Navigation
  TabNavigator: NavigatorScreenParams<TabParamList>;
  MainApp: undefined;

  // Budget Stack
  BudgetStack: NavigatorScreenParams<BudgetStackParamList>;

  // Wallet Screens
  CreateWallet: undefined;
  EditWallet: { walletId: string };
  SelectWallet: {
    selectedWalletId?: string;
    onSelectWallet?: (wallet: any) => void;
  };

  // Category Screens
  Categories: undefined;
  CreateCategory: {
    type: "expense" | "income" | "debt_loan";
    parentCategory?: any;
  };
  EditCategory: { categoryId: string };
  SelectCategory: {
    type: "expense" | "income" | "debt_loan";
    selectedCategoryId?: string;
    onSelectCategory?: (category: any) => void;
  };

  // Transaction Screens
  AddTransaction: { type?: "income" | "expense" };
  EditTransaction: { transactionId: string };

  // Profile & Settings
  EditProfile: { user: User };
  Settings: undefined;
  SecurityScreen: undefined;

  // Notifications
  NotificationSettings: undefined;

  // Other Screens
  About: undefined;
  PrivacyPolicy: undefined;
  TermsOfUse: undefined;

  // Account Management
  Logout: undefined;
  DeleteAccount: undefined;

  // Additional screens
  Onboarding: undefined;
  Security: undefined;
  ChangePin: undefined;
  TermsAndConditions: undefined;
  NotificationScreen: undefined;
  WalletScreen: undefined;
  CreateWalletScreen: undefined;
  EditWalletScreen: { wallet: any };
  IncomeExpenseReportScreen: undefined;
  AddNote: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Transactions: undefined;
  Reports: undefined;
  AddTransaction:
    | {
        preSelectedCategory?: string;
        preSelectedWalletId?: string;
        type?: "expense" | "income";
      }
    | undefined;
  EditTransaction: {
    transactionId: string;
  };
  NotificationScreen: undefined;
  WalletScreen: undefined;
  CreateWalletScreen: undefined;
  EditWalletScreen: { wallet: any };
};

export type TransactionStackParamList = {
  Transaction:
    | {
        selectedWalletId?: string;
      }
    | undefined;
  AddTransaction: {
    type?: "income" | "expense";
    preSelectedWalletId?: string;
    preSelectedCategory?: string;
  };
  EditTransaction: { transactionId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: { user: User };
  Security: undefined;
  NotificationSettings: undefined;
  Help: undefined;
  Terms: undefined;
  ChangePassword: undefined;
  DeleteAccount: undefined;
  Logout: undefined;
};

export type SavingStackParamList = {
  Saving: undefined;
};

export type WalletStackParamList = {
  SelectWalletScreen: {
    onSelectWallet: (wallet: Wallet) => void;
    includeAddWallet?: boolean;
    walletIdsToExclude?: string[];
  };
  CreateWalletScreen: {
    onCreateWallet?: (wallet: Wallet) => void;
  };
  EditWalletScreen: {
    walletId: string;
  };
  ListWalletScreen: undefined;
};

export interface Wallet {
  _id: string;
  name: string;
  balance: number;
  icon: string;
  color?: string;
  isDefault: boolean;
  isIncludedInTotal: boolean;
}
