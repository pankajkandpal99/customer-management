import { getAuthHeader } from "@/lib/authHeader";
import axios from "axios";

const API_URL = "/api/dashboard/notifications";

export const getNotifications = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getAuthHeader() });
    return response.data.notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await axios.put(
      `${API_URL}/${notificationId}`,
      { read: true },
      { headers: getAuthHeader() }
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to update notification status");
  }
};
