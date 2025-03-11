import { StyleSheet } from "react-native";

const faceIDStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00C897",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enableButton: {
    backgroundColor: "#00C897",
  },
  disableButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
  scanArea: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#00C897",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "rgba(0, 200, 151, 0.05)",
    shadowColor: "#00C897",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  faceIcon: {
    shadowColor: "#00C897",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  scanIcon: {
    width: 150,
    height: 150,
  },
  successContainer: {
    alignItems: "center",
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00C897",
    marginTop: 20,
  },
});

export default faceIDStyles;
