import { z } from "zod";

export const ChangeInfoChatSchema = z.object({
  chatName: z
    .string()
    .min(1)
    .max(30)
    .regex(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/),
  description: z.string().max(300),
});

export type TypeChangeInfoChatSchema = z.infer<typeof ChangeInfoChatSchema>;
