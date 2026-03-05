import { Pin, PinOff, Trash2, X } from 'lucide-react-native'
import React, { FC, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	Modal,
	Pressable,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import Loader from '@/components/ui/Loader'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import ChatsItem from './ChatsItem'
import {
	FindAllChatsByGroupQuery,
	GroupPermissionEnum,
	useGetMemberRoleQuery
} from '@/graphql/generated/output'

interface ChatDropdownTrigger {
	chat: FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
	deleteChat: (chatId: string) => void
	groupId: string
	onPinChat?: (chatId: string) => void
	onUnPinChat?: (chatId: string) => void
	onDrag?: () => void
	isActive?: boolean
}

const SCREEN_HEIGHT = Dimensions.get('window').height

const ChatDropdownTrigger: FC<ChatDropdownTrigger> = ({
	deleteChat,
	chat,
	groupId,
	onPinChat,
	onUnPinChat,
	onDrag,
	isActive
}) => {
	const [modalVisible, setModalVisible] = useState(false)
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
	const { colors } = useTheme()
	const { t } = useTranslation()

	const { data: memberRoleData, loading: isLoadingMemberRole } =
		useGetMemberRoleQuery({
			variables: { groupId }
		})

	const currentRole = memberRoleData?.getMemberRole
	const canDeleteGroup =
		currentRole?.permissions.includes(GroupPermissionEnum.DeleteGroup) ||
		currentRole?.isCreator

	const openSheet = () => {
		setModalVisible(true)
		Animated.spring(slideAnim, {
			toValue: 0,
			useNativeDriver: true,
			tension: 65,
			friction: 11
		}).start()
	}

	const closeSheet = (cb?: () => void) => {
		Animated.timing(slideAnim, {
			toValue: SCREEN_HEIGHT,
			duration: 200,
			useNativeDriver: true
		}).start(() => {
			setModalVisible(false)
			cb?.()
		})
	}

	const handleDelete = () => {
		closeSheet(() => deleteChat(chat.id))
	}

	const handlePin = () => {
		closeSheet(() => {
			if (chat.isPinned) {
				onUnPinChat?.(chat.id)
			} else {
				onPinChat?.(chat.id)
			}
		})
	}

	if (isLoadingMemberRole) {
		return (
			<View className='p-4'>
				<Loader />
			</View>
		)
	}

	return (
		<View style={{ opacity: isActive ? 0.9 : 1 }}>
			<ChatsItem
				groupId={groupId}
				chat={chat}
				handleLongPress={() => {
					if (chat.isPinned && onDrag) {
						onDrag()
					} else {
						openSheet()
					}
				}}
			/>

			<Modal
				transparent
				visible={modalVisible}
				animationType='none'
				onRequestClose={() => closeSheet()}
			>
				<View className='flex-1'>
					{/* Dimmed backdrop */}
					<Pressable
						className='flex-1'
						style={{ backgroundColor: colors.overlay }}
						onPress={() => closeSheet()}
					/>

					{/* Bottom sheet */}
					<Animated.View
						style={{
							transform: [{ translateY: slideAnim }],
							backgroundColor: colors.backgroundTertiary,
							borderTopLeftRadius: 20,
							borderTopRightRadius: 20,
							borderTopWidth: 1,
							borderColor: colors.borderLight,
							paddingBottom: 34,
							paddingTop: 8
						}}
					>
						{/* Handle bar */}
						<View className='items-center mb-2'>
							<View
								style={{
									width: 36,
									height: 4,
									borderRadius: 2,
									backgroundColor: colors.textMuted
								}}
							/>
						</View>

						{/* Chat info preview */}
						<View
							className='mx-4 mb-3 px-3 py-2 rounded-xl'
							style={{
								backgroundColor: colors.cardHover,
								borderLeftWidth: 3,
								borderLeftColor: colors.accent
							}}
						>
							<Text
								className='text-sm font-semibold'
								style={{ color: colors.text }}
							>
								{chat.chatName}
							</Text>
						</View>

						{/* Actions */}
						<View className='px-3'>
							{/* Pin/Unpin action */}
							<TouchableOpacity
								onPress={handlePin}
								activeOpacity={0.6}
								className='flex-row items-center px-4 py-3 rounded-xl mb-1'
							>
								<View
									className='w-9 h-9 rounded-full items-center justify-center mr-3'
									style={{
										backgroundColor:
											'hsla(210, 80%, 50%, 0.15)'
									}}
								>
									{chat.isPinned ? (
										<PinOff
											size={20}
											color={colors.accent}
										/>
									) : (
										<Pin size={20} color={colors.accent} />
									)}
								</View>
								<Text
									className='text-sm font-medium'
									style={{ color: colors.text }}
								>
									{chat.isPinned
										? t('unpinChat') || 'Открепить'
										: t('pinChat') || 'Закрепить'}
								</Text>
							</TouchableOpacity>

							{/* Delete action */}
							{canDeleteGroup && (
								<TouchableOpacity
									onPress={handleDelete}
									activeOpacity={0.6}
									className='flex-row items-center px-4 py-3 rounded-xl mb-1'
								>
									<View
										className='w-9 h-9 rounded-full items-center justify-center mr-3'
										style={{
											backgroundColor:
												'hsla(0, 80%, 50%, 0.15)'
										}}
									>
										<Trash2
											size={20}
											color={colors.destructive}
										/>
									</View>
									<Text
										className='text-sm font-medium'
										style={{ color: colors.destructive }}
									>
										{t('deleteChat')}
									</Text>
								</TouchableOpacity>
							)}
						</View>
					</Animated.View>
				</View>
			</Modal>
		</View>
	)
}

export default ChatDropdownTrigger
