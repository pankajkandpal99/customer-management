import { getAuthHeader } from "@/lib/authHeader";
import axios from "axios";

export const fetchDashboardStats = async () => {
  try {
    const response = await axios.get(`/api/dashboard/stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const fetchRecentPayments = async (limit = 5) => {
  try {
    const response = await axios.get(
      `/api/dashboard/payments/recent?limit=${limit}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching recent payments:", error);
    throw error;
  }
};

export const fetchRecentNotifications = async (limit = 5) => {
  try {
    const response = await axios.get(
      `/api/dashboard/notifications/recent?limit=${limit}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching recent notifications:", error);
    throw error;
  }
};

export const fetchPayments = async (params = {}) => {
  try {
    const response = await axios.get(`/api/dashboard/payments`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};
