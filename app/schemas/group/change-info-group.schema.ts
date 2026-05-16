import { z } from 'zod'

type ChangeInfoGroupValidationTranslator = (
	key: 'groupNameRequired' | 'nameMax' | 'namePattern' | 'descriptionMax'
) => string

const defaultMessages: Record<
	Parameters<ChangeInfoGroupValidationTranslator>[0],
	string
> = {
	groupNameRequired: 'Group name is required.',
	nameMax: 'Name must be at most 30 characters long',
	namePattern: 'Name can only contain English letters, digits, and -',
	descriptionMax: 'Description must be at most 300 characters long'
}

const defaultT: ChangeInfoGroupValidationTranslator = key =>
	defaultMessages[key]

export const createChangeInfoGroupSchema = (
	t: ChangeInfoGroupValidationTranslator = defaultT
) =>
	z.object({
		groupName: z
			.string()
			.min(1, { message: t('groupNameRequired') })
			.max(30, { message: t('nameMax') })
			.regex(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, {
				message: t('namePattern')
			}),
		description: z.string().max(300, { message: t('descriptionMax') })
	})

export const ChangeInfoGroupSchema = createChangeInfoGroupSchema()

export type TypeChangeInfoGroupSchema = z.infer<
	ReturnType<typeof createChangeInfoGroupSchema>
>
