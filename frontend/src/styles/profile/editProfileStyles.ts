import { StyleSheet, Platform } from "react-native";

const editProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Header with gradient effect
  headerGradient: {
    width: "100%",
  },
  enhancedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 200, 151, 0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#00C897",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: "#A8DFD4",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  // Animated container for content
  animatedContainer: {
    flex: 1,
    width: "100%",
  },
  // Updated avatar section
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "white",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 15,
    marginHorizontal: 15,
    marginTop: 15,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#E3FFF8",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00C897",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  // Enhanced form section
  formSection: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    paddingBottom: 15,
    paddingHorizontal: 5,
  },
  activeInputGroup: {
    borderBottomColor: "#00C897",
    backgroundColor: "rgba(0, 200, 151, 0.03)",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: -5,
  },
  inputIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E3FFF8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    fontSize: 16,
    color: "#333",
    padding: 0,
    paddingVertical: 4,
  },
  // Enhanced info section
  infoSection: {
    backgroundColor: "#E3FFF8",
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 15,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 160, 123, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#00A07B",
    lineHeight: 20,
  },
  // Floating button for bottom of screen
  floatingButton: {
    backgroundColor: "#00C897",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default editProfileStyles;
