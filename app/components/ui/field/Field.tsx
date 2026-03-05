import cn from 'clsx'
import { Controller } from 'react-hook-form'
import { Text, TextInput, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

import { IField } from './field.interface'

const Field = <T extends Record<string, any>>({
	control,
	rules,
	name,
	className,
	...rest
}: IField<T>): JSX.Element => {
	const { colors } = useTheme()

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
							style={{ color: colors.text, fontSize: 16 }}
							placeholderTextColor={colors.textMuted}
							{...rest}
						/>
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
