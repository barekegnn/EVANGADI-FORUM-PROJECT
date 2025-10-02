import * as z from "zod";

// Define the type for placeholder images
export interface PlaceholderImage {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

// Load the placeholder images data
import placeholderData from "./placeholder-images.json";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export const RegisterSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

// Export the placeholder images data with proper typing
export const placeholderImages: PlaceholderImage[] =
  placeholderData.placeholderImages;
