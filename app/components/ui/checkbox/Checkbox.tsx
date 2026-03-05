import { Check } from 'lucide-react-native'
import React from 'react'
import { Pressable, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

interface CheckboxProps {
	checked: boolean
	onCheckedChange: (checked: boolean) => void
	size?: number
	color?: string
}

const Checkbox: React.FC<CheckboxProps> = ({
	checked,
	onCheckedChange,
	size = 24,
	color
}) => {
	const { colors } = useTheme()
	const checkColor = color || colors.accent

	return (
		<Pressable
			onPress={() => onCheckedChange(!checked)}
			style={{
				width: size,
				height: size,
				borderWidth: 2,
				borderColor: checked ? colors.accent : colors.border,
				borderRadius: 6,
				backgroundColor: checked ? colors.accent : 'transparent',
				justifyContent: 'center',
				alignItems: 'center'
			}}
		>
			{checked && <Check size={size - 4} color='#fff' />}
		</Pressable>
	)
}

export default Checkbox
