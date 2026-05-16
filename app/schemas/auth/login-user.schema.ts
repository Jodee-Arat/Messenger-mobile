import { z } from 'zod'

type LoginUserValidationTranslator = (
	key: 'loginMin' | 'passwordMin' | 'passwordPattern'
) => string

const defaultMessages: Record<
	Parameters<LoginUserValidationTranslator>[0],
	string
> = {
	loginMin: 'Login must be at least 3 characters long',
	passwordMin: 'Password must be at least 8 characters long',
	passwordPattern:
		'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
}

const defaultT: LoginUserValidationTranslator = key => defaultMessages[key]

export const createLoginUserSchema = (
	t: LoginUserValidationTranslator = defaultT
) =>
	z.object({
		login: z.string().min(3, { message: t('loginMin') }),
		password: z
			.string()
			.min(8, { message: t('passwordMin') })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/, {
				message: t('passwordPattern')
			})
	})

export const loginUserSchema = createLoginUserSchema()

export type LoginUserSchemaType = z.infer<
	ReturnType<typeof createLoginUserSchema>
>
