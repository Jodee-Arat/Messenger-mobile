import { z } from "zod";

export const forwardMessageSchema = z.object({
  text: z
    .string()
    .min(1)
    .refine((value) => value.trim() !== "", {
      message: "Text cannot be empty.",
    }),
  targetChatsId: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one user.",
    }),
});

export type ForwardMessageSchemaType = z.infer<typeof forwardMessageSchema>;
