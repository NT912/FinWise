import apiClient from "./apiClient";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "transaction" | "budget" | "wallet";
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  currentPage: number;
  totalPages: number;
}

// Get all notifications
export const getNotifications = async () => {
  try {
    const response = await apiClient.get<NotificationResponse>(
      "/api/notifications"
    );
    return response.data.notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Get unread notifications count
export const getUnreadCount = async () => {
  try {
    const response = await apiClient.get("/api/notifications/unread-count");
    return response.data.unreadCount;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId: string) => {
  try {
    const response = await apiClient.post(`/api/notifications/mark-read`, {
      notificationIds: [notificationId],
    });
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await apiClient.post("/api/notifications/mark-all-read");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await apiClient.delete("/api/notifications", {
      data: { notificationIds: [notificationId] },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Delete all notifications
export const deleteAllNotifications = async () => {
  try {
    const response = await apiClient.delete("/api/notifications/all");
    return response.data;
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    throw error;
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
