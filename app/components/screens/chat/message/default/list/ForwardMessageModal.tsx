import { zodResolver } from '@hookform/resolvers/zod'
import { Share2 } from 'lucide-react-native'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	ActivityIndicator,
	Animated,
	Image,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	useWindowDimensions
} from 'react-native'
import Toast from 'react-native-toast-message'

import AppModal from '@/components/ui/AppModal'
import { Button } from '@/components/ui/button/Button'
import Checkbox from '@/components/ui/checkbox/Checkbox'

import { useCenteredModalLayout } from '@/hooks/useModalLayout'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useUser } from '@/hooks/useUser'

import {
	FindAllChatsByUserQuery,
	useFindAllChatsByUserQuery,
	useForwardChatMessageMutation
} from '@/graphql/generated/output'
import {
	ForwardMessageSchemaType,
	forwardMessageSchemaFactory
} from '@/schemas/chat/forward-message.schema'

interface ForwardMessageModalProp {
	messageIds?: string[]
	handleClearMessagesId: () => void
	chatId: string
	groupId?: string | null
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

const ForwardMessageModal: FC<ForwardMessageModalProp> = ({
	messageIds,
	handleClearMessagesId,
	chatId,
	groupId
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const schema = useMemo(() => forwardMessageSchemaFactory(t), [t])
	const { userId } = useUser()
	const { cardMarginBottom, cardMaxHeight } = useCenteredModalLayout(0.8)
	const [isOpen, setIsOpen] = useState(false)
	const { height: windowHeight } = useWindowDimensions()

	const slideAnim = useRef(new Animated.Value(windowHeight)).current

	const closeSheet = (cb?: () => void) => {
		Animated.timing(slideAnim, {
			toValue: windowHeight,
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
		const allChats = dataChats?.findAllChatsByUser ?? []
		return allChats.filter(
			chat => !chat.isSecret && chat.isGroup && chat.groupId === groupId
		)
	}, [dataChats, groupId])

	const form = useForm<ForwardMessageSchemaType>({
		resolver: zodResolver(schema),
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
					Toast.show({
						type: 'success',
						text1: t('messageForwarded') || 'Message forwarded'
					})
					form.reset()
				})
			},
			onError() {}
		})

	const canSubmitForward =
		isValid && !isLoadingForwardingMessage && !isLoadingFindAllChatsByUser

	const onSubmit = (data: ForwardMessageSchemaType) => {
		if (!messageIds || messageIds.length === 0) return
		if (data.targetChatsId.length === 0) return
		if (!trimmedForwardText) return

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
			slideAnim.setValue(windowHeight)
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		}
	}, [isOpen, refetch, slideAnim, windowHeight])

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
					<Pressable
						className='flex-1'
						style={{
							position: 'absolute',
							top: 0,
							bottom: 0,
							left: 0,
							right: 0,
							backgroundColor: colors.overlay
						}}
						onPress={() => closeSheet()}
					/>
					<Animated.View
						className='mx-4 rounded-2xl p-4 max-h-[80%]'
						style={{
							transform: [{ translateY: slideAnim }],
							backgroundColor: colors.backgroundTertiary,
							borderWidth: 1,
							borderColor: colors.borderLight,
							height: cardMaxHeight,
							marginBottom: cardMarginBottom,
							overflow: 'hidden'
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
									className='rounded-lg p-2 mb-1'
									style={{
										borderWidth: 1,
										borderColor: form.formState.errors.text
											? colors.destructive
											: colors.borderLight,
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
						{form.formState.errors.text?.message ? (
							<Text
								className='text-xs mb-2'
								style={{ color: colors.destructive }}
							>
								{form.formState.errors.text.message}
							</Text>
						) : null}

						<Text
							className='text-xs mb-3'
							style={{ color: colors.textMuted }}
						>
							{t('writeMessage')}
						</Text>

						<View style={{ flex: 1, minHeight: 0 }}>
							{isLoadingFindAllChatsByUser ? (
								<ActivityIndicator
									size='small'
									className='my-3'
								/>
							) : (
								<ScrollView
									showsVerticalScrollIndicator={false}
									keyboardShouldPersistTaps='handled'
								>
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
										const preview = getChatPreview(
											chat,
											userId
										)

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
																	field.onChange(
																		[
																			...field.value,
																			chat.id
																		]
																	)
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
																numberOfLines={
																	1
																}
																style={{
																	color: colors.text
																}}
															>
																{preview.title}
															</Text>
															<Text
																className='text-xs'
																numberOfLines={
																	1
																}
																style={{
																	color: colors.textSecondary
																}}
															>
																{chat
																	.lastMessage
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
						</View>
						{form.formState.errors.targetChatsId?.message ? (
							<Text
								className='text-xs mt-2'
								style={{ color: colors.destructive }}
							>
								{form.formState.errors.targetChatsId.message}
							</Text>
						) : null}

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
