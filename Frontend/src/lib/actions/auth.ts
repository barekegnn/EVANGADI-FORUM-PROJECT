"use server";

import { z } from "zod";
import { RegisterSchema, LoginSchema } from "@/lib/schemas";
import api from "@/lib/axios";
import { AxiosError } from "axios";

export async function register(values: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  try {
    const response = await api.post("/auth/register", validatedFields.data);
    return {
      success:
        response.data.message || "Registration successful! You can now log in.",
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return { error: error.response.data.message || "Registration failed." };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

export async function login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  try {
    const response = await api.post("/auth/login", validatedFields.data);
    const { token, message } = response.data;

    if (token) {
      return { success: message || "Login successful!", token: token };
    }

    return { error: "Login failed. Please try again." };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return {
        error: error.response.data.message || "Invalid email or password!",
      };
    }
    return { error: "Something went wrong. Please try again." };
  }
}
