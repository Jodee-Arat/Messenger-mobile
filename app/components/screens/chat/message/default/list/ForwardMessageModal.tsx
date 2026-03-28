import { zodResolver } from '@hookform/resolvers/zod'
import { Share2 } from 'lucide-react-native'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	ActivityIndicator,
	Image,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Animated,
	Dimensions,
	Pressable
} from 'react-native'
import Toast from 'react-native-toast-message'

import AppModal from '@/components/ui/AppModal'
import { Button } from '@/components/ui/button/Button'
import Checkbox from '@/components/ui/checkbox/Checkbox'

import { useCenteredModalLayout } from '@/hooks/useModalLayout'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useUser } from '@/hooks/useUser'

import { MessageType } from '@/types/message.type'

import { setPendingForward } from '@/utils/pending-forward'

import { navigate } from '@/navigation/navigate'

import {
	FindAllChatsByUserQuery,
	useFindAllChatsByUserQuery,
	useForwardChatMessageMutation
} from '@/graphql/generated/output'
import {
	ForwardMessageSchemaType,
	forwardMessageSchema
} from '@/schemas/chat/forward-message.schema'

interface ForwardMessageModalProp {
	handleAddForwarded: (messageIds: string[], initialText?: string) => void
	messageIds?: string[]
	selectedMessages?: MessageType[]
	handleClearMessagesId: () => void
	chatId: string
	currentGroupId?: string | null
}

type ChatItem = FindAllChatsByUserQuery['findAllChatsByUser'][0]

function getChatPreview(chat: ChatItem, userId: string) {
	if (!chat.isGroup) {
		const otherMember =
			chat.members.find(member => member.user.id !== userId)?.user ??
			chat.members[0]?.user

		return {
			title: otherMember?.username || chat.chatName || 'Direct message',
			avatarUrl: otherMember?.avatarUrl ?? chat.avatarUrl ?? null
		}
	}

	return {
		title: chat.chatName || 'Chat',
		avatarUrl: chat.avatarUrl ?? null
	}
}

const SCREEN_HEIGHT = Dimensions.get('window').height

const ForwardMessageModal: FC<ForwardMessageModalProp> = ({
	messageIds,
	selectedMessages,
	handleClearMessagesId,
	handleAddForwarded,
	chatId,
	currentGroupId
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { userId } = useUser()
	const { cardMarginBottom, cardMaxHeight } = useCenteredModalLayout(0.8)
	const [isOpen, setIsOpen] = useState(false)
	
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current

	const closeSheet = (cb?: () => void) => {
		Animated.timing(slideAnim, {
			toValue: SCREEN_HEIGHT,
			duration: 200,
			useNativeDriver: true
		}).start(() => {
			setIsOpen(false)
			cb?.()
		})
	}

	const {
		data: dataChats,
		loading: isLoadingFindAllChatsByUser,
		refetch
	} = useFindAllChatsByUserQuery({
		skip: !isOpen,
		fetchPolicy: 'network-only',
		variables: {
			filters: {}
		}
	})

	const chats = useMemo(() => {
		const availableChats = (dataChats?.findAllChatsByUser ?? []).filter(
			chat => !chat.isSecret
		)

		if (!currentGroupId) {
			return availableChats
		}

		return availableChats.filter(chat => chat.groupId === currentGroupId)
	}, [currentGroupId, dataChats])

	const form = useForm<ForwardMessageSchemaType>({
		resolver: zodResolver(forwardMessageSchema),
		mode: 'onChange',
		defaultValues: {
			text: '',
			targetChatsId: []
		}
	})

	const { isValid } = form.formState
	const forwardText = form.watch('text') ?? ''
	const trimmedForwardText = forwardText.trim()

	const [forwardMessage, { loading: isLoadingForwardingMessage }] =
		useForwardChatMessageMutation({
			onCompleted() {
				closeSheet(() => {
					const selectedChats = form.getValues('targetChatsId')
					const currentText = trimmedForwardText
					if (selectedChats.length === 1) {
						const selectedChat = chats.find(
							chat => chat.id === selectedChats[0]
						)

						if (selectedChat) {
							// Store forwarded messages so the target chat can show them immediately
							if (selectedMessages && selectedMessages.length > 0) {
								setPendingForward({
									chatId: selectedChat.id,
									messages: selectedMessages,
									text: currentText
								})
							}
							const preview = getChatPreview(selectedChat, userId)
							navigate('Chat', {
								chatId: selectedChat.id,
								chatName: preview.title,
								isSecret: selectedChat.isSecret,
								groupId: selectedChat.groupId || undefined
							})
						}
					}
					form.reset()
				})
			},
			onError() {}
		})

	const canSubmitForward =
		isValid &&
		trimmedForwardText.length > 0 &&
		!isLoadingForwardingMessage &&
		!isLoadingFindAllChatsByUser

	const onSubmit = (data: ForwardMessageSchemaType) => {
		if (!messageIds || messageIds.length === 0) return
		if (data.targetChatsId.length === 0) return
		if (!trimmedForwardText) {
			Toast.show({
				type: 'error',
				text1: t('writeMessage')
			})
			return
		}

		if (
			data.targetChatsId.length === 1 &&
			data.targetChatsId[0] === chatId
		) {
			handleAddForwarded(messageIds, trimmedForwardText)
			handleClearMessagesId()
			closeSheet()
			return
		}

		forwardMessage({
			variables: {
				chatId,
				data: {
					forwardedMessageIds: messageIds,
					text: trimmedForwardText,
					fileIds: [],
					targetChatsId: data.targetChatsId
				}
			}
		})

		handleClearMessagesId()
	}

	useEffect(() => {
		if (isOpen) {
			void refetch()
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		}
	}, [isOpen, refetch])

	return (
		<>
			<TouchableOpacity
				onPress={() => setIsOpen(true)}
				activeOpacity={0.6}
				className='w-10 h-10 rounded-full items-center justify-center'
				style={{ backgroundColor: colors.cardHover }}
			>
				<Share2 size={20} color={colors.text} />
			</TouchableOpacity>

			<AppModal
				visible={isOpen}
				animationType='none'
				transparent
				statusBarTranslucent
				navigationBarTranslucent
			>
				<View className='flex-1 justify-center'>
					<Pressable className='flex-1' style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }} onPress={() => closeSheet()} />
					<Animated.View
						className='mx-4 rounded-2xl p-4 max-h-[80%]'
						style={{
							transform: [{ translateY: slideAnim }],
							backgroundColor: colors.backgroundTertiary,
							borderWidth: 1,
							borderColor: colors.borderLight,
							maxHeight: cardMaxHeight,
							marginBottom: cardMarginBottom
						}}
					>
						<Text
							className='text-xl font-semibold mb-3 text-center'
							style={{ color: colors.text }}
						>
							{t('forwardMessages')}
						</Text>

						<Controller
							control={form.control}
							name='text'
							render={({ field }) => (
								<TextInput
									className='rounded-lg p-2 mb-3'
									style={{
										borderWidth: 1,
										borderColor: colors.borderLight,
										backgroundColor: colors.inputBg,
										color: colors.text
									}}
									placeholder={t('writeMessage')}
									placeholderTextColor={colors.textMuted}
									value={field.value}
									onChangeText={field.onChange}
								/>
							)}
						/>

						<Text
							className='text-xs mb-3'
							style={{ color: colors.textMuted }}
						>
							{t('writeMessage')}
						</Text>

						{isLoadingFindAllChatsByUser ? (
							<ActivityIndicator size='small' className='my-3' />
						) : (
							<ScrollView className='max-h-[50vh]'>
								{chats.length === 0 && (
									<View className='py-4 items-center'>
										<Text
											style={{
												color: colors.textSecondary
											}}
										>
											{t('noChats')}
										</Text>
									</View>
								)}
								{chats.map(chat => {
									const preview = getChatPreview(chat, userId)

									return (
										<Controller
											key={chat.id}
											control={form.control}
											name='targetChatsId'
											render={({ field }) => (
												<TouchableOpacity
													className='flex-row items-center mb-3'
													activeOpacity={0.7}
													onPress={() => {
														const checked =
															!field.value.includes(
																chat.id
															)
														field.onChange(
															checked
																? [
																		...field.value,
																		chat.id
																	]
																: field.value.filter(
																		(
																			id: string
																		) =>
																			id !==
																			chat.id
																	)
														)
													}}
												>
													<Checkbox
														checked={field.value.includes(
															chat.id
														)}
														onCheckedChange={(
															checked: boolean
														) => {
															if (checked) {
																field.onChange([
																	...field.value,
																	chat.id
																])
															} else {
																field.onChange(
																	field.value.filter(
																		(
																			id: string
																		) =>
																			id !==
																			chat.id
																	)
																)
															}
														}}
													/>

													<Image
														source={{
															uri:
																preview.avatarUrl ||
																'https://placehold.co/50'
														}}
														className='w-10 h-10 rounded-full ml-3'
													/>
													<View className='ml-3 flex-1'>
														<Text
															className='text-base font-medium'
															numberOfLines={1}
															style={{
																color: colors.text
															}}
														>
															{preview.title}
														</Text>
														<Text
															className='text-xs'
															numberOfLines={1}
															style={{
																color: colors.textSecondary
															}}
														>
															{chat.lastMessage
																?.text
																? `${chat.lastMessage.user.username}: ${chat.lastMessage.text}`
																: t(
																		'noMessages'
																	)}
														</Text>
													</View>
												</TouchableOpacity>
											)}
										/>
									)
								})}
							</ScrollView>
						)}

						<Button
							onPress={form.handleSubmit(onSubmit)}
							disabled={!canSubmitForward}
							className='mt-4'
						>
							{t('forward')}
						</Button>

						<TouchableOpacity onPress={() => closeSheet()}>
							<Text
								className='text-center mt-3 font-medium'
								style={{ color: colors.textSecondary }}
							>
								{t('cancel')}
							</Text>
						</TouchableOpacity>
					</Animated.View>
				</View>
			</AppModal>
		</>
	)
}

export default ForwardMessageModal
