import { createStackNavigator } from "@react-navigation/stack";

// Định nghĩa kiểu dữ liệu cho tất cả các màn hình trong Stack Navigation
export type RootStackParamList = {
  Launch: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Home: undefined;
  Transactions: undefined;
  Categories: undefined;
  Savings: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

// Tạo Stack Navigator với kiểu dữ liệu đã định nghĩa
const Stack = createStackNavigator<RootStackParamList>();

export default Stack;
