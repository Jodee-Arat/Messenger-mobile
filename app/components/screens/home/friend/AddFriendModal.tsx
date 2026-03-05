import { FC } from 'react'
import {
	ActivityIndicator,
	Modal,
	Pressable,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'

interface AddFriendModalProps {
	visible: boolean
	username: string
	isSending: boolean
	onChangeUsername: (text: string) => void
	onSend: () => void
	onClose: () => void
}

const AddFriendModal: FC<AddFriendModalProps> = ({
	visible,
	username,
	isSending,
	onChangeUsername,
	onSend,
	onClose
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	return (
		<Modal
			visible={visible}
			transparent
			animationType='fade'
			onRequestClose={onClose}
		>
			<Pressable
				className='flex-1 justify-center items-center'
				style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
				onPress={onClose}
			>
				<Pressable
					className='w-[85%] rounded-2xl p-5'
					style={{ backgroundColor: colors.card }}
					onPress={() => {}}
				>
					<Text
						className='text-lg font-bold mb-4'
						style={{ color: colors.text }}
					>
						{t('addFriend')}
					</Text>

					<TextInput
						value={username}
						onChangeText={onChangeUsername}
						placeholder={t('enterUsername')}
						placeholderTextColor={colors.textMuted}
						autoCapitalize='none'
						autoCorrect={false}
						className='rounded-xl px-4 py-3 text-sm mb-4'
						style={{
							backgroundColor: colors.cardHover,
							color: colors.text,
							borderWidth: 1,
							borderColor: colors.border
						}}
					/>

					<View className='flex-row justify-end' style={{ gap: 10 }}>
						<TouchableOpacity
							onPress={onClose}
							className='px-4 py-2 rounded-xl'
							style={{ backgroundColor: colors.cardHover }}
						>
							<Text style={{ color: colors.textSecondary }}>
								{t('cancel')}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={onSend}
							disabled={isSending || !username.trim()}
							className='px-4 py-2 rounded-xl'
							style={{
								backgroundColor: colors.accent,
								opacity: isSending || !username.trim() ? 0.5 : 1
							}}
						>
							{isSending ? (
								<ActivityIndicator size='small' color='#fff' />
							) : (
								<Text
									className='font-semibold'
									style={{ color: '#fff' }}
								>
									{t('send')}
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	)
}

export default AddFriendModal
