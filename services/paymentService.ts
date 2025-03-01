/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaymentFormValues } from "@/app/lib/zodSchema";
import { getAuthHeader } from "@/lib/authHeader";
import pusherClient from "@/lib/pusher-client";
import axios from "axios";

const API_URL = "/api/dashboard/payments";

export const getPayments = async (customerId?: string) => {
  try {
    const url = customerId
      ? `/api/dashboard/payments?customerId=${customerId}`
      : `/api/dashboard/payments`;

    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw new Error("Failed to fetch payments");
  }
};

export const addPayment = async (paymentData: PaymentFormValues) => {
  try {
    const response = await axios.post(API_URL, paymentData, {
      headers: getAuthHeader(),
    });

    console.log("payment created : ", response);

    return response.data;
  } catch {
    throw new Error("Failed to add customer");
  }
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: "Paid" | "Pending"
) => {
  try {
    const response = await axios.put(
      `${API_URL}/${paymentId}`,
      { status },
      { headers: getAuthHeader() }
    );

    console.log("response : ", response);

    return response.data.payment;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw new Error("Failed to update payment status");
  }
};

export const getRecentPayments = async () => {
  try {
    const response = await axios.get(`${API_URL}/recent-payments`, {
      headers: getAuthHeader(),
    });
    return response.data.payments || [];
  } catch (error) {
    console.error("Error fetching recent payments:", error);
    throw new Error("Failed to fetch recent payments");
  }
};

export const subscribeToPaymentUpdates = (
  callback: (newPayment: any) => void
) => {
  const channel = pusherClient.subscribe("dashboard-updates");
  channel.bind("new-payment", (newPayment: any) => {
    callback(newPayment);
  });

  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
};
