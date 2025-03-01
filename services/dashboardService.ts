/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuthHeader } from "@/lib/authHeader";
import axios from "axios";

const API_URL = "/api/dashboard";

const fetchData = async (endpoint: string, defaultValue: any = null) => {
  try {
    const response = await axios.get(`${API_URL}/${endpoint}`, {
      headers: getAuthHeader(),
    });

    // console.log("response : ", response);
    return response.data || defaultValue;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return defaultValue;
  }
};

export const getRecentPayments = async () => {
  return await fetchData("payments/recent-payments", []);
};

export const getTotalCustomers = async () => {
  const data = await fetchData("customers/count", { totalCustomers: 0 });
  return data.totalCustomers;
};

export const getOverduePayments = async () => {
  const data = await fetchData("payments/overdue", { overdueAmount: 0 });
  return data.overdueAmount;
};

export const getTotalCollected = async () => {
  const data = await fetchData("payments/total-collected", {
    totalCollected: 0,
  });
  return data.totalCollected;
};

export const getCollectionRate = async () => {
  const data = await fetchData("payments/collection-rate", {
    collectionRate: 0,
  });
  return data.collectionRate;
};
