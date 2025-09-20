import { z } from "zod";

export const createGroupSchema = z.object({
  groupName: z.string().min(1, {
    message: "Group name is required.",
  }),
  userIds: z.array(z.string()),
});

export type createGroupSchemaType = z.infer<typeof createGroupSchema>;
