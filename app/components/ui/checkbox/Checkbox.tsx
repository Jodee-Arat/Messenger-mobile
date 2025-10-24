import { Check } from 'lucide-react-native'
import React from 'react'
import { Pressable, View } from 'react-native'

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
	color = '#000'
}) => {
	return (
		<Pressable
			onPress={() => onCheckedChange(!checked)}
			className={`border-2 border-black rounded-md justify-center items-center`}
			style={{ width: size, height: size }}
		>
			{checked && <Check size={size - 4} color={color} />}
		</Pressable>
	)
}

export default Checkbox
