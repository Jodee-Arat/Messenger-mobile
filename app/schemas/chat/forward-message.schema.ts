import { z } from 'zod'

type ForwardMessageValidationTranslator = (
	key: 'messageTextEmpty' | 'selectAtLeastOneChat'
) => string

const defaultMessages: Record<
	Parameters<ForwardMessageValidationTranslator>[0],
	string
> = {
	messageTextEmpty: 'Message text cannot be empty.',
	selectAtLeastOneChat: 'Select at least one chat.'
}

const defaultT: ForwardMessageValidationTranslator = key => defaultMessages[key]

export const forwardMessageSchemaFactory = (
	t: ForwardMessageValidationTranslator = defaultT
) =>
	z.object({
		text: z
			.string()
			.min(1, { message: t('messageTextEmpty') })
			.refine(value => value.trim() !== '', {
				message: t('messageTextEmpty')
			}),
		targetChatsId: z
			.array(z.string())
			.refine(value => value.some(item => item), {
				message: t('selectAtLeastOneChat')
			})
	})

export const forwardMessageSchema = forwardMessageSchemaFactory()

export type ForwardMessageSchemaType = z.infer<
	ReturnType<typeof forwardMessageSchemaFactory>
>
