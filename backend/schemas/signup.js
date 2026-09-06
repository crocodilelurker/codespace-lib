import { z } from "zod";

export const signupSchema = z.object({
    body: z.object({
        name: z.string()
            .min(3, "minimum 3 characters required")
            .max(20, "maximum 20 characters allowed")
            .trim(),
        email: z.string()
            .email("invalid email address")
            .toLowerCase()
            .trim(),
        password: z.string()
            .min(6, "min 6 length passcode")
            .max(20, "max 20 length passcode")
            .trim(),
        phoneNumber: z.string()
            .trim()
            .min(10, "min 10 length phone number")
    })
});

