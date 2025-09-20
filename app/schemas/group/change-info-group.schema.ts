import { z } from "zod";

export const ChangeInfoGroupSchema = z.object({
  groupName: z
    .string()
    .min(1)
    .max(30)
    .regex(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/),
  description: z.string().max(300),
});

export type TypeChangeInfoGroupSchema = z.infer<typeof ChangeInfoGroupSchema>;
