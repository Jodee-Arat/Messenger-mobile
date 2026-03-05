import { Lock } from 'lucide-react-native'
import React, { FC } from 'react'
import { Pressable, Text, View } from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTheme, useTranslation } from '@/hooks/useTheme'

export interface ChatItemData {
	id: string
	chatName?: string | null
	avatarUrl?: string | null
	isSecret: boolean
	groupId?: string | null
	lastMessage?: {
		text?: string | null
		user: { username: string }
		files?: Array<{ fileName: string }> | null
	} | null
	draftMessages?: Array<{
		text: string
		files: Array<{ fileName: string }>
	}> | null
}

interface ChatItemRowProps {
	chat: ChatItemData
	onPress: () => void
	onLongPress?: () => void
	showSecretIcon?: boolean
	showOnlineIndicator?: boolean
}

const ChatItemRow: FC<ChatItemRowProps> = ({
	chat,
	onPress,
	onLongPress,
	showSecretIcon = true,
	showOnlineIndicator = false
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	const hasDraftText =
		chat.draftMessages &&
		chat.draftMessages.length > 0 &&
		chat.draftMessages[0]?.text

	const hasDraftFiles =
		chat.draftMessages &&
		chat.draftMessages.length > 0 &&
		chat.draftMessages[0]?.files?.length &&
		chat.draftMessages[0].files.length > 0

	const hasLastMessageText = chat.lastMessage && chat.lastMessage?.text

	const hasLastMessageFiles =
		chat.lastMessage &&
		chat.lastMessage.files?.length &&
		chat.lastMessage.files.length > 0

	const renderSubtitle = () => {
		if (hasDraftText) {
			return (
				<View className='flex-row items-center'>
					<Text
						className='text-xs font-semibold mr-1'
						style={{ color: colors.destructive }}
					>
						{t('draft') + ':'}
					</Text>
					<Text
						className='text-xs flex-1'
						numberOfLines={1}
						style={{ color: colors.textSecondary }}
					>
						{chat.draftMessages![0]!.text}
					</Text>
				</View>
			)
		}

		if (hasDraftFiles) {
			return (
				<View className='flex-row items-center'>
					<Text
						className='text-xs font-semibold mr-1'
						style={{ color: colors.destructive }}
					>
						{t('draft') + ':'}
					</Text>
					<Text
						className='text-xs'
						style={{ color: 'hsl(210, 80%, 65%)' }}
					>
						{chat.draftMessages![0]!.files!.length} {t('files')}
					</Text>
				</View>
			)
		}

		if (hasLastMessageText) {
			return (
				<Text
					className='text-xs flex-1'
					numberOfLines={1}
					style={{ color: colors.textSecondary }}
				>
					<Text
						className='text-xs font-medium'
						style={{ color: colors.accent }}
					>
						{chat.lastMessage!.user.username}:{' '}
					</Text>
					{chat.lastMessage!.text}
				</Text>
			)
		}

		if (hasLastMessageFiles) {
			return (
				<Text
					className='text-xs'
					numberOfLines={1}
					style={{ color: colors.textSecondary }}
				>
					<Text
						className='text-xs font-medium'
						style={{ color: colors.accent }}
					>
						{chat.lastMessage!.user.username}:{' '}
					</Text>
					<Text style={{ color: 'hsl(210, 80%, 65%)' }}>
						{chat.lastMessage!.files!.length} {t('files')}
					</Text>
				</Text>
			)
		}

		return (
			<Text className='text-xs' style={{ color: colors.textMuted }}>
				{t('noMessages')}
			</Text>
		)
	}

	return (
		<Pressable
			onLongPress={onLongPress}
			delayLongPress={300}
			className='w-full'
			onPress={onPress}
			android_ripple={{
				color: chat.isSecret
					? 'rgba(76, 175, 80, 0.08)'
					: 'rgba(139, 92, 246, 0.08)'
			}}
		>
			<View
				className='w-full px-4 py-3 flex-row items-center'
				style={{
					borderBottomWidth: 0.5,
					borderBottomColor: colors.border,
					...(chat.isSecret && {
						borderLeftWidth: 3,
						borderLeftColor: '#4CAF50',
						backgroundColor: 'rgba(76, 175, 80, 0.06)'
					})
				}}
			>
				<View className='relative'>
					<EntityAvatar
						name={chat.chatName}
						avatarUrl={chat.avatarUrl}
						size='lg'
					/>
					{showOnlineIndicator && (
						<View
							className='absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full'
							style={{
								backgroundColor: colors.success,
								borderWidth: 2,
								borderColor: colors.background
							}}
						/>
					)}
				</View>

				<View className='ml-3 flex-1'>
					<View className='flex-row items-center'>
						{showSecretIcon && chat.isSecret && (
							<Lock
								size={13}
								color='#4CAF50'
								style={{ marginRight: 4 }}
							/>
						)}
						<Text
							className='text-base font-semibold'
							numberOfLines={1}
							style={{ color: colors.text }}
						>
							{chat.chatName}
						</Text>
					</View>
					<View className='mt-0.5'>{renderSubtitle()}</View>
				</View>
			</View>
		</Pressable>
	)
}

export default ChatItemRow
