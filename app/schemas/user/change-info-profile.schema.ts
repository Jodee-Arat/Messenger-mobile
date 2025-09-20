import { z } from "zod";

export const ChangeInfoProfileSchema = z.object({
  username: z
    .string()
    .min(6)
    .max(30)
    .regex(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/),
  bio: z.string().max(300),
});

export type TypeChangeInfoProfileSchema = z.infer<
  typeof ChangeInfoProfileSchema
>;
