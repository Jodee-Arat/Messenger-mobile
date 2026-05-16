import { z } from 'zod'

type CreateChatValidationTranslator = (
	key: 'chatNameRequired' | 'selectAtLeastOneUser'
) => string

const defaultMessages: Record<
	Parameters<CreateChatValidationTranslator>[0],
	string
> = {
	chatNameRequired: 'Chat name is required.',
	selectAtLeastOneUser: 'You have to select at least one user.'
}

const defaultT: CreateChatValidationTranslator = key => defaultMessages[key]

export const createChatSchemaFactory = (
	t: CreateChatValidationTranslator = defaultT
) =>
	z.object({
		chatName: z.string().min(1, {
			message: t('chatNameRequired')
		}),
		userIds: z.array(z.string()).refine(value => value.some(item => item), {
			message: t('selectAtLeastOneUser')
		}),
		isSecretChat: z.boolean().optional()
	})

export const createChatSchema = createChatSchemaFactory()

export type createChatSchemaType = z.infer<
	ReturnType<typeof createChatSchemaFactory>
>
