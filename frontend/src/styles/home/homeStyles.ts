import { StyleSheet } from "react-native";

const homeStyles = StyleSheet.create({
  // 🔄 Loading Spinner
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  listContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },

  // 🏠 Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  userName: {
    fontSize: 16,
    color: "gray",
    marginTop: 2,
  },

  // 💰 Balance Overview
  balanceCard: {
    backgroundColor: "#00C897",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceLabel: {
    color: "white",
    fontSize: 14,
  },
  balanceAmount: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  expenseAmount: {
    color: "#FFD700",
    fontSize: 22,
    fontWeight: "bold",
  },
  progressBar: {
    alignSelf: "center",
    marginTop: 10,
  },

  // 🎯 Savings on Goals
  savingsCard: {
    backgroundColor: "#00C897",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  savingsGoalItem: {
    marginBottom: 15,
  },
  savingsTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  goalAmount: {
    fontSize: 14,
    color: "#555",
  },
  savingsProgressBar: {
    alignSelf: "center",
  },
  noGoalsText: {
    textAlign: "center",
    color: "gray",
    fontSize: 14,
  },

  // 📅 Filter Buttons
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: "#00C897",
  },
  filterText: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
  },
  filterTextActive: {
    color: "white",
  },

  // 📋 Transactions Header
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    color: "#00C897",
    fontWeight: "bold",
  },

  // 💳 Transaction List Items
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  transactionDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionTextContainer: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionTime: {
    fontSize: 12,
    color: "gray",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  incomeText: {
    color: "#00C897",
  },
  expenseText: {
    color: "#FF4D4D",
  },
});

export default homeStyles;
