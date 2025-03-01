/* eslint-disable @typescript-eslint/no-explicit-any */
import { setCookie } from "cookies-next";
import { LoginFormValues, RegisterFormValues } from "../app/lib/zodSchema";
import axios from "axios";

export const registerUser = async (data: RegisterFormValues) => {
  try {
    const response = await axios.post("/api/auth/register", data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error registering user: ", error);

    if (error.response) {
      throw new Error(error.response.data.error || "Something went wrong");
    } else if (error.request) {
      throw new Error("No response from server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const loginUser = async (data: LoginFormValues) => {
  try {
    const response = await axios.post("/api/auth/login", data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    const { token } = response.data;
    setCookie("jwt", token, { maxAge: 60 * 60 * 24 * 7 });

    return { success: true, token };
  } catch (error: any) {
    console.error("Login Error:", error);

    let errorMessage = "Something went wrong!";
    if (error.response) {
      errorMessage = error.response.data.error || errorMessage;
    }

    return { success: false, error: errorMessage };
  }
};
