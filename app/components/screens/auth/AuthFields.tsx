import { FC } from 'react'
import { Control } from 'react-hook-form'

import Field from '@/components/ui/field/Field'

import { IAuthFormData } from '@/types/auth.interface'

import { validEmail } from './email.regex'

interface IAuthFields {
	control: Control<IAuthFormData>
	isPassRequired?: boolean
	isReg?: boolean
}

const AuthFields: FC<IAuthFields> = ({ control, isPassRequired, isReg }) => {
	return (
		<>
			<Field<IAuthFormData>
				placeholder='Enter login'
				control={control}
				name='login'
				rules={{
					required: 'Login is required!',
					minLength: {
						value: 3,
						message: 'Login should be minimum 3 characters long'
					}
				}}
				keyboardType='email-address'
			/>
			{isReg && (
				<Field<IAuthFormData>
					placeholder='Enter email'
					control={control}
					name='email'
					rules={{
						required: 'Email is required!',
						pattern: {
							value: validEmail,
							message: 'Please enter a valid email address'
						}
					}}
					keyboardType='email-address'
				/>
			)}
			<Field<IAuthFormData>
				placeholder='Enter password'
				control={control}
				name='password'
				secureTextEntry
				rules={{
					required: 'Password is required!',
					minLength: {
						value: 6,
						message: 'Password should be minimum 6 characters long'
					}
				}}
			/>
		</>
	)
}

export default AuthFields
