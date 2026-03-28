import type { ReactElement } from 'react'
import { useState } from 'react'
import cn from 'clsx'
import { Eye, EyeOff } from 'lucide-react-native'
import { Controller } from 'react-hook-form'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

import { IField } from './field.interface'

const Field = <T extends Record<string, any>>({
	control,
	rules,
	name,
	className,
	...rest
}: IField<T>): ReactElement => {
	const { colors } = useTheme()
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const isSecureField = !!rest.secureTextEntry

	return (
		<Controller
			control={control}
			name={name}
			rules={rules}
			render={({
				field: { value, onChange, onBlur },
				fieldState: { error }
			}) => (
				<>
					<View
						className={cn(
							'w-full rounded-lg pb-4 pt-2.5 px-4 my-1.5',
							className
						)}
						style={{
							backgroundColor: colors.inputBg,
							borderWidth: 1,
							borderColor: error
								? colors.destructive
								: colors.border,
							borderRadius: 12
						}}
					>
						<TextInput
							autoCapitalize='none'
							onChangeText={onChange}
							onBlur={onBlur}
							value={(value || '').toString()}
							{...rest}
							secureTextEntry={
								isSecureField ? !isPasswordVisible : undefined
							}
							style={{
								color: colors.text,
								fontSize: 16,
								letterSpacing: 0,
								paddingRight: isSecureField ? 36 : 0
							}}
							placeholderTextColor={colors.textMuted}
						/>
						{isSecureField && (
							<TouchableOpacity
								onPress={() =>
									setIsPasswordVisible(prev => !prev)
								}
								activeOpacity={0.7}
								style={{
									position: 'absolute',
									right: 12,
									top: 0,
									bottom: 0,
									justifyContent: 'center'
								}}
								hitSlop={{
									top: 8,
									bottom: 8,
									left: 8,
									right: 8
								}}
							>
								{isPasswordVisible ? (
									<EyeOff
										size={18}
										color={colors.textMuted}
									/>
								) : (
									<Eye size={18} color={colors.textMuted} />
								)}
							</TouchableOpacity>
						)}
					</View>
					{error && (
						<Text
							style={{
								color: colors.destructive,
								fontSize: 12,
								marginLeft: 4
							}}
						>
							{error.message}
						</Text>
					)}
				</>
			)}
		/>
	)
}

export default Field
