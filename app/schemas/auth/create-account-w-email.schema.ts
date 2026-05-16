import { z } from 'zod'

type CreateAccountValidationTranslator = (
	key:
		| 'usernameMin'
		| 'usernamePattern'
		| 'emailInvalid'
		| 'emailMin'
		| 'passwordMin'
		| 'passwordPattern'
) => string

const defaultMessages: Record<
	Parameters<CreateAccountValidationTranslator>[0],
	string
> = {
	usernameMin: 'Username must be at least 5 characters long',
	usernamePattern:
		'Username can only contain Russian/English letters, digits, _ and -',
	emailInvalid: 'Invalid email address',
	emailMin: 'Email must be at least 3 characters long',
	passwordMin: 'Password must be at least 8 characters long',
	passwordPattern:
		'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
}

const defaultT: CreateAccountValidationTranslator = key => defaultMessages[key]

export const createAccountWEmailSchemaFactory = (
	t: CreateAccountValidationTranslator = defaultT
) =>
	z.object({
		username: z
			.string()
			.min(5, { message: t('usernameMin') })
			.regex(/^[a-zA-Zа-яА-ЯёЁ0-9_]+(?:-[a-zA-Zа-яА-ЯёЁ0-9_]+)*$/, {
				message: t('usernamePattern')
			}),
		email: z
			.string()
			.email({ message: t('emailInvalid') })
			.min(3, { message: t('emailMin') }),
		password: z
			.string()
			.min(8, { message: t('passwordMin') })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/, {
				message: t('passwordPattern')
			})
	})

export const createAccountWEmailSchema = createAccountWEmailSchemaFactory()

export type createAccountWEmailSchemaType = z.infer<
	ReturnType<typeof createAccountWEmailSchemaFactory>
>
