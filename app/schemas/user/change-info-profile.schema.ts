import { z } from 'zod'

type ChangeInfoProfileValidationTranslator = (
	key: 'usernameMin' | 'usernameMax' | 'usernamePattern' | 'bioMax'
) => string

const defaultMessages: Record<
	Parameters<ChangeInfoProfileValidationTranslator>[0],
	string
> = {
	usernameMin: 'Username must be at least 3 characters long',
	usernameMax: 'Username must be at most 30 characters long',
	usernamePattern:
		'Username can only contain Russian/English letters, digits, _ and -',
	bioMax: 'Bio must be at most 300 characters long'
}

const defaultT: ChangeInfoProfileValidationTranslator = key =>
	defaultMessages[key]

export const createChangeInfoProfileSchema = (
	t: ChangeInfoProfileValidationTranslator = defaultT
) =>
	z.object({
		username: z
			.string()
			.min(3, { message: t('usernameMin') })
			.max(30, { message: t('usernameMax') })
			.regex(/^[a-zA-Zа-яА-ЯёЁ0-9_]+(?:-[a-zA-Zа-яА-ЯёЁ0-9_]+)*$/, {
				message: t('usernamePattern')
			}),
		bio: z.string().max(300, { message: t('bioMax') })
	})

export const ChangeInfoProfileSchema = createChangeInfoProfileSchema()

export type TypeChangeInfoProfileSchema = z.infer<
	ReturnType<typeof createChangeInfoProfileSchema>
>
