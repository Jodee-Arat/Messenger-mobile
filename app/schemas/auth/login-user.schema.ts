import { z } from "zod";

export const loginUserSchema = z.object({
  login: z
    .string()
    .min(3, { message: "Login must be at least 3 characters long" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
});

export type LoginUserSchemaType = z.infer<typeof loginUserSchema>;
