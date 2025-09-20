import { z } from "zod";

export const createAccountWEmailSchema = z.object({
  username: z
    .string()
    .min(5, { message: "Username must be at least 5 characters long" })
    .regex(/^[a-zA-Z0-9_]+(?:-[a-zA-Z0-9_]+)*$/),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(3, { message: "Email must be at least 3 characters long" }),
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

export type createAccountWEmailSchemaType = z.infer<
  typeof createAccountWEmailSchema
>;
