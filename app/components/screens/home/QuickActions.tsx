import type { FC, ReactElement } from 'react'
import { TouchableOpacity, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

interface QuickActionsProps {
	actions: {
		icon: ReactElement
		label?: string
		onPress?: () => void
	}[]
}

const QuickActions: FC<QuickActionsProps> = ({ actions }) => {
	const { colors } = useTheme()

	return (
		<View className='flex-row px-4 pt-4 pb-3' style={{ gap: 10 }}>
			{actions.map((action, i) => (
				<TouchableOpacity
					key={i}
					onPress={action.onPress}
					activeOpacity={0.7}
					accessibilityRole='button'
					accessibilityLabel={action.label}
					className='flex-1 rounded-2xl'
					style={{
						minWidth: 0,
						height: 54,
						backgroundColor: colors.cardHover,
						borderWidth: 1,
						borderColor: colors.border
					}}
				>
					<View
						className='flex-1 items-center justify-center'
						style={{ minWidth: 0 }}
					>
						{action.icon}
					</View>
				</TouchableOpacity>
			))}
		</View>
	)
}

export default QuickActions
