import { z } from 'zod'

type ChangeInfoChatValidationTranslator = (
	key: 'chatNameRequired' | 'nameMax' | 'namePattern' | 'descriptionMax'
) => string

const defaultMessages: Record<
	Parameters<ChangeInfoChatValidationTranslator>[0],
	string
> = {
	chatNameRequired: 'Chat name is required.',
	nameMax: 'Name must be at most 30 characters long',
	namePattern: 'Name can only contain English letters, digits, and -',
	descriptionMax: 'Description must be at most 300 characters long'
}

const defaultT: ChangeInfoChatValidationTranslator = key => defaultMessages[key]

export const createChangeInfoChatSchema = (
	t: ChangeInfoChatValidationTranslator = defaultT
) =>
	z.object({
		chatName: z
			.string()
			.min(1, { message: t('chatNameRequired') })
			.max(30, { message: t('nameMax') })
			.regex(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, {
				message: t('namePattern')
			}),
		description: z.string().max(300, { message: t('descriptionMax') })
	})

export const ChangeInfoChatSchema = createChangeInfoChatSchema()

export type TypeChangeInfoChatSchema = z.infer<
	ReturnType<typeof createChangeInfoChatSchema>
>
