import { ChevronRight } from 'lucide-react-native'
import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTheme } from '@/hooks/useTheme'

export const FriendItem: FC<{
	id: string
	username: string
	avatarUrl?: string | null
	onPress: (id: string) => void
	onRemove: (id: string) => void
}> = ({ id, username, avatarUrl, onPress, onRemove }) => {
	const { colors } = useTheme()
	return (
		<TouchableOpacity
			activeOpacity={0.6}
			onPress={() => onPress(id)}
			className='flex-row items-center px-5 py-3'
			style={{
				borderBottomWidth: 0.5,
				borderBottomColor: colors.border
			}}
		>
			<EntityAvatar name={username} avatarUrl={avatarUrl} size='lg' />
			<View className='ml-3 flex-1'>
				<Text
					className='text-sm font-semibold'
					style={{ color: colors.text }}
					numberOfLines={1}
				>
					{username}
				</Text>
			</View>
			<ChevronRight size={18} color={colors.textMuted} />
		</TouchableOpacity>
	)
}
