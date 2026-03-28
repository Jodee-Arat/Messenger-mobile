import { FC } from 'react'
import { Control } from 'react-hook-form'

import Field from '@/components/ui/field/Field'

import { useTranslation } from '@/hooks/useTheme'

import { IAuthFormData } from '@/types/interface/auth.interface'

import { validEmail } from './email.regex'

interface IAuthFields {
	control: Control<IAuthFormData>
	isPassRequired?: boolean
	isReg?: boolean
}

const AuthFields: FC<IAuthFields> = ({ control, isPassRequired, isReg }) => {
	const { t } = useTranslation()

	return (
		<>
			<Field<IAuthFormData>
				placeholder={t('enterLogin')}
				control={control}
				name='login'
				rules={{
					required: t('loginRequired'),
					minLength: {
						value: 3,
						message: t('loginMin')
					}
				}}
				keyboardType='default'
				autoComplete='username'
				textContentType='username'
			/>
			{isReg && (
				<Field<IAuthFormData>
					placeholder={t('enterEmail')}
					control={control}
					name='email'
					rules={{
						required: t('emailRequired'),
						pattern: {
							value: validEmail,
							message: t('emailInvalid')
						}
					}}
					keyboardType='email-address'
					autoComplete='email'
					textContentType='emailAddress'
				/>
			)}
			<Field<IAuthFormData>
				placeholder={t('enterPassword')}
				control={control}
				name='password'
				secureTextEntry
				autoComplete='password'
				textContentType='password'
				rules={{
					required: t('passwordRequired'),
					minLength: {
						value: 8,
						message: t('passwordMin')
					},
					pattern: {
						value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/,
						message: t('passwordPattern')
					}
				}}
			/>
		</>
	)
}

export default AuthFields
