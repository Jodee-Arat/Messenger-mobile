import { X } from 'lucide-react-native'
import React, { FC } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { MessageType } from '@/types/message.type'

import { useUnPinMessageMutation } from '@/graphql/generated/output'

interface PinnedMessageProps {
	pinnedMessage: MessageType | null
	setPinnedMessage: (message: MessageType | null) => void
	chatId: string
}

const PinnedMessage: FC<PinnedMessageProps> = ({
	pinnedMessage,
	setPinnedMessage,
	chatId
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const [unpinMessage, { loading: isUnpinning }] = useUnPinMessageMutation({
		onCompleted() {
			setPinnedMessage(null)
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: t('unpinError'),
				text2: error.message || t('somethingWentWrong')
			})
		}
	})

	if (!pinnedMessage) return null

	return (
		<View
			className='px-3 py-2 flex-row items-center justify-between rounded-xl mx-3 mt-2'
			style={{
				backgroundColor: colors.cardHover,
				borderWidth: 1,
				borderColor: colors.borderLight
			}}
		>
			<View className='flex-1'>
				<Text
					className='text-sm font-semibold'
					style={{ color: colors.accent }}
				>
					{pinnedMessage.user.username}
				</Text>

				{pinnedMessage.text ? (
					<Text
						className='text-xs'
						style={{ color: colors.textSecondary }}
						numberOfLines={1}
					>
						{pinnedMessage.text}
					</Text>
				) : pinnedMessage.files?.length ? (
					<Text
						className='text-xs'
						style={{ color: colors.accent }}
					>
						{pinnedMessage.files.length} {t('files')}
					</Text>
				) : (
					<Text
						className='text-xs'
						style={{ color: colors.textMuted }}
					>
						{t('empty')}
					</Text>
				)}
			</View>

			<TouchableOpacity
				onPress={() => unpinMessage({ variables: { chatId } })}
				disabled={isUnpinning}
				className='ml-2 p-1'
			>
				{isUnpinning ? (
					<ActivityIndicator
						size='small'
						color={colors.accent}
					/>
				) : (
					<X size={18} color={colors.textSecondary} />
				)}
			</TouchableOpacity>
		</View>
	)
}

export default PinnedMessage
