import { z } from "zod";

export const sendMessageSchema = z.object({
  text: z.string().optional(),
});

export type SendMessageSchemaType = z.infer<typeof sendMessageSchema>;
