import { CustomerFormValues } from "@/app/lib/zodSchema";
import { getAuthHeader } from "@/lib/authHeader";
import axios from "axios";

const API_URL = "/api/dashboard/customers";

export const getCustomers = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
};

export const addCustomer = async (customerData: CustomerFormValues) => {
  try {
    const response = await axios.post(API_URL, customerData, {
      headers: getAuthHeader(),
    });
    // console.log("response in service : ", response);
    return response.data;
  } catch {
    throw new Error("Failed to add customer");
  }
};

export const updateCustomer = async (
  customerId: string,
  customerData: CustomerFormValues
) => {
  try {
    const response = await axios.put(`${API_URL}/${customerId}`, customerData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch {
    throw new Error("Failed to update customer");
  }
};

export const deleteCustomer = async (customerId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/${customerId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw new Error("Failed to delete customer");
  }
};

export const getSingleCustomer = async (customerId: string) => {
  try {
    const response = await axios.get(`${API_URL}/${customerId}`, {
      headers: getAuthHeader(),
    });

    // console.log("customer :", response);

    return response.data.customer;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw new Error("Failed to delete customer");
  }
};

export const uploadBulkCustomers = async (formData: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/upload-bulk`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error uploading bulk customers :", error);
    throw new Error("Failed to upload customers");
  }
};
