import { z } from "zod";

export const createChatSchema = z.object({
  chatName: z.string().min(1, {
    message: "Chat name is required.",
  }),
  userIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one user.",
  }),
});

export type createChatSchemaType = z.infer<typeof createChatSchema>;
