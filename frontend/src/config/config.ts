export const config = {
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.2:3002",
    timeout: 30000,
  },
  app: {
    name: "FinWise",
    version: "1.0.0",
  },
  auth: {
    tokenKey: "token",
    userKey: "user",
  },
} as const;

export type Config = typeof config;

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
