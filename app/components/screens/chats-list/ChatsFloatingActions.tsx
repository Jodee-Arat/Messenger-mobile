import { MessageSquarePlus, Shield } from 'lucide-react-native'
import { FC } from 'react'
import { TouchableOpacity, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

import { loadAllSecretChats } from '@/utils/secret-chat/secretChat'

interface ChatsFloatingActionsProps {
	groupId: string
	onCreatePress: () => void
}

const ChatsFloatingActions: FC<ChatsFloatingActionsProps> = ({
	groupId,
	onCreatePress
}) => {
	const { colors } = useTheme()

	return (
		<View
			className='absolute right-5 bottom-8 items-center'
			style={{ gap: 12 }}
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
