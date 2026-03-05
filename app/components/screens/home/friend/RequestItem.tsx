import { Check, X } from 'lucide-react-native'
import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTheme, useTranslation } from '@/hooks/useTheme'

type RequestItemProps = {
	id: string
	username: string
	avatarUrl?: string | null
	type: 'incoming' | 'outgoing'
	onAccept?: (id: string) => void
	onDecline?: (id: string) => void
	onCancel?: (id: string) => void
}

export const RequestItem: FC<RequestItemProps> = ({
	id,
	username,
	avatarUrl,
	type,
	onAccept,
	onDecline,
	onCancel
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	return (
		<View
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
				<Text
					className='text-xs'
					style={{ color: colors.textSecondary }}
				>
					{type === 'incoming'
						? t('incomingRequest')
						: t('outgoingRequest')}
				</Text>
			</View>

			{type === 'incoming' ? (
				<>
					<TouchableOpacity
						onPress={() => onAccept?.(id)}
						className='p-2 mr-1'
					>
						<Check size={18} color={colors.success} />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => onDecline?.(id)}
						className='p-2'
					>
						<X size={18} color={colors.destructive} />
					</TouchableOpacity>
				</>
			) : (
				<TouchableOpacity
					onPress={() => onCancel?.(id)}
					className='p-2'
				>
					<X size={18} color={colors.warning} />
				</TouchableOpacity>
			)}
		</View>
	)
}
