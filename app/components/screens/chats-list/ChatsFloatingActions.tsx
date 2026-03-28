import { MessageSquarePlus } from 'lucide-react-native'
import { FC } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'

interface ChatsFloatingActionsProps {
	onCreatePress: () => void
}

const ChatsFloatingActions: FC<ChatsFloatingActionsProps> = ({
	onCreatePress
}) => {
	const { colors } = useTheme()
	const { bottom } = useSafeAreaInsets()

	return (
		<View
			className='absolute right-5 items-center'
			style={{
				gap: 12,
				bottom: bottom + 20
			}}
		>
			{/* Create chat */}
			<TouchableOpacity
				onPress={onCreatePress}
				activeOpacity={0.7}
				className='w-14 h-14 rounded-full items-center justify-center'
				style={{
					backgroundColor: colors.accent,
					shadowColor: colors.accent,
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.4,
					shadowRadius: 8,
					elevation: 8
				}}
			>
				<MessageSquarePlus size={24} color='#fff' />
			</TouchableOpacity>
		</View>
	)
}

export default ChatsFloatingActions
