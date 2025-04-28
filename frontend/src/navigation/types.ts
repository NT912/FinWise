import { NavigatorScreenParams } from "@react-navigation/native";
import Wallet from "../screens/Wallet/WalletScreen";
import { User } from "../types";

export type RootStackParamList = {
  Launch: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  ForgotPassword: undefined;
  SecurityPin: { email: string };
  ResetPassword: { email: string; resetCode: string };
  PrivacyPolicy: undefined;
  TermsOfUse: undefined;
  TabNavigator: NavigatorScreenParams<TabParamList>;
  AddTransaction: { type?: "income" | "expense" };
  EditTransaction: { transactionId: string };
  AddNote: {
    note: string;
    onSaveNote: (note: string) => void;
  };
  CreateWalletScreen: undefined;
  WalletScreen:
    | {
        onSelectWallet?: (walletId: string) => void;
        selectedWalletId?: string | null;
        showAllWalletsOption?: boolean;
        refresh?: boolean;
      }
    | undefined;
  NotificationScreen: undefined;
  IncomeExpenseReportScreen: undefined;
  Home: undefined;
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  EditWalletScreen: { walletId: string; wallet?: any };
  BudgetScreen: undefined;
  SettingScreen: undefined;
  AboutScreen: undefined;
  HelpScreen: undefined;
  ContactScreen: undefined;
  TermsOfServiceScreen: undefined;
  Transaction: undefined;
  Charts: undefined;
  Categories: undefined;
  Settings: undefined;
  Notifications: undefined;
  PrivacyPolicyScreen: undefined;
  SettingsScreen: undefined;
  EditProfile: { user: User };
  SecurityScreen: undefined;
  NotificationSettingsScreen: undefined;
  LogoutScreen: undefined;
  DeleteAccountScreen: undefined;
  TermsAndConditionsScreen: undefined;
  ChangePasswordScreen: undefined;
  Security: undefined;
  ChangePin: undefined;
  TermsAndConditions: undefined;
  SelectWallet: {
    selectedWalletId?: string;
    onSelectWallet?: (wallet: any) => void;
  };
  SelectCategory: {
    selectedCategoryId?: string;
    onSelectCategory?: (category: any) => void;
    type?: "expense" | "income" | "debt_loan";
  };
  CreateCategory: {
    type: "expense" | "income" | "debt_loan";
    parentCategory?: any;
  };
};

export type TabParamList = {
  HomeTab: undefined;
  TransactionTab: undefined;
  ChartsTab: undefined;
  ProfileTab: undefined;
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

export type ChartsStackParamList = {
  Charts: undefined;
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
