import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

interface QuickActionsProps {
	actions: {
		icon: JSX.Element
		label?: string
		onPress?: () => void
	}[]
}

const QuickActions: FC<QuickActionsProps> = ({ actions }) => {
	const { colors } = useTheme()

	return (
		<View className='flex-row px-4 pt-3 pb-2' style={{ gap: 10 }}>
			{actions.map((action, i) => (
				<TouchableOpacity
					key={i}
					onPress={action.onPress}
					activeOpacity={0.7}
					className='flex-1 flex-row items-center rounded-xl px-4 py-3'
					style={{
						backgroundColor: colors.cardHover,
						borderWidth: 1,
						borderColor: colors.border
					}}
				>
					{action.icon}
					<Text
						className='ml-2.5 text-sm font-medium'
						style={{ color: colors.text }}
					>
						{action.label}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	)
}

export default QuickActions
