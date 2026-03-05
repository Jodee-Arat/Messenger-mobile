import { z } from 'zod'

export const forwardMessageSchema = z.object({
	text: z.string(),
	targetChatsId: z
		.array(z.string())
		.refine(value => value.some(item => item), {
			message: 'You have to select at least one user.'
		})
})

export type ForwardMessageSchemaType = z.infer<typeof forwardMessageSchema>
