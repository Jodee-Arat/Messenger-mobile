import { z } from 'zod'

export const ChangeInfoProfileSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(30)
		.regex(/^[a-zA-Zа-яА-ЯёЁ0-9_]+(?:-[a-zA-Zа-яА-ЯёЁ0-9_]+)*$/, {
			message:
				'Username can only contain Russian/English letters, digits, _ and -'
		}),
	bio: z.string().max(300)
})

export type TypeChangeInfoProfileSchema = z.infer<
	typeof ChangeInfoProfileSchema
>
