import { zodResolver } from '@hookform/resolvers/zod'
import type { ImagePickerAsset } from 'expo-image-picker'
import { Lock, X } from 'lucide-react-native'
import React, { FC, useEffect, useRef, useState } from 'react'
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
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import AppModal from '@/components/ui/AppModal'
import EntityAvatar from '@/components/ui/EntityAvatar'
import Checkbox from '@/components/ui/checkbox/Checkbox'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useBottomSheetModalLayout } from '@/hooks/useModalLayout'
import { initGroupSessionAction } from '@/hooks/useSecretChat.actions'
import { useTheme, useTranslation } from '@/hooks/useTheme'

import { getStoredSecretSessionId } from '@/services/secret/secret-session.service'

import { pickAvatarImage } from '@/utils/avatar-image-picker'
import { createImageUploadFile } from '@/utils/create-image-upload-file'
import {
	createMyKey,
	createSecretChat,
	loadMyPreKeyJSON
} from '@/utils/secret-chat/secretChat'
import {
	clearSecretChatBootstrapPending,
	markSecretChatBootstrapPending
} from '@/utils/secret-chat/secretChatBootstrap'

import {
	FindAllChatsByGroupDocument,
	FindAllChatsByGroupQuery,
	useChangeChatAvatarMutation,
	useCreateChatMutation,
	useFindChatByChatIdLazyQuery,
	useFindGroupByGroupIdQuery,
	useGetSecretSessionPreKeysLazyQuery,
	useSendSessionSharedSecretKeyMutation
} from '@/graphql/generated/output'
import {
	createChatSchemaFactory,
	createChatSchemaType
} from '@/schemas/user/create-chat.schema'

interface CreateChatModalProp {
	groupId: string
	setAllChats: React.Dispatch<
		React.SetStateAction<FindAllChatsByGroupQuery['findAllChatsByGroup']>
	>
	isOpen: boolean
	setIsOpen: (open: boolean) => void
}

const CreateChatModal: FC<CreateChatModalProp> = ({
	groupId,
	setAllChats,
	isOpen,
	setIsOpen
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const schema = React.useMemo(() => createChatSchemaFactory(t), [t])
	const {
		containerPaddingBottom,
		windowHeight,
		sheetMaxHeight,
		sheetPaddingBottom
	} = useBottomSheetModalLayout(0.85)
	const [selectedAvatar, setSelectedAvatar] =
		useState<ImagePickerAsset | null>(null)
	const [isPickingAvatar, setIsPickingAvatar] = useState(false)

	const slideAnim = useRef(new Animated.Value(windowHeight)).current

	const resetState = () => {
		form.reset({
			chatName: '',
			userIds: [],
			isSecretChat: false
		})
		setSelectedAvatar(null)
	}

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

	const { user: currentUser } = useCurrentUser()
	const {
		data,
		loading: isLoadingFindGroup,
		refetch
	} = useFindGroupByGroupIdQuery({
		skip: !isOpen,
		variables: { groupId }
	})

	const form = useForm<createChatSchemaType>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			chatName: '',
			userIds: [],
			isSecretChat: false
		}
	})

	const users = (data?.findGroupByGroupId?.members ?? []).filter(
		m => m.user.id !== currentUser?.id
	)
	const selectedUserIds = form.watch('userIds')
	const [getPreKeys] = useGetSecretSessionPreKeysLazyQuery({
		fetchPolicy: 'network-only'
	})
	const [findChatById] = useFindChatByChatIdLazyQuery({
		fetchPolicy: 'network-only'
	})
	const [sendSharedSecretKey] = useSendSessionSharedSecretKeyMutation()
	const [changeChatAvatar, { loading: isUploadingAvatar }] =
		useChangeChatAvatarMutation()

	const bootstrapSecretGroupChat = async (chatId: string) => {
		try {
			if (!currentUser?.id) return

			const myPreKeys = await loadMyPreKeyJSON()
			const secretSessionId = await getStoredSecretSessionId()
			if (!myPreKeys) {
				console.warn(
					'[SecretChat][CreateChat] local prekeys missing, skip bootstrap'
				)
				return
			}
			if (!secretSessionId) {
				console.warn(
					'[SecretChat][CreateChat] secretSessionId missing, skip bootstrap'
				)
				return
			}

			const chatResponse = await findChatById({
				variables: { chatId },
				fetchPolicy: 'network-only'
			})
			const fullChat = chatResponse.data?.findChatByChatId
			if (!fullChat?.isSecret || !fullChat.isGroup || !fullChat.groupId) {
				return
			}

			await createSecretChat(fullChat, true)

			const preKeysResponse = await getPreKeys({
				variables: { chatId },
				fetchPolicy: 'network-only'
			})
			const preKeys = preKeysResponse.data?.getSecretSessionPreKeys ?? []
			if (preKeys.length === 0) {
				console.warn(
					'[SecretChat][CreateChat] no preKeys found after secret chat creation'
				)
				return
			}

			const initResult = await initGroupSessionAction({
				chat: fullChat,
				chatId,
				groupId: fullChat.groupId,
				userId: currentUser.id,
				secretSessionId,
				mySecretPreKey: myPreKeys.toStore,
				preKeysPub: preKeys,
				getPreKeys,
				sendSharedSecretKey
			})

			if (initResult.errorMessage) {
				console.warn(
					'[SecretChat][CreateChat] bootstrap failed:',
					initResult.errorMessage
				)
				return
			}

			if (initResult.groupKey && initResult.needPersistKey) {
				await createMyKey(
					chatId,
					fullChat.groupId,
					currentUser.id,
					initResult.groupKey
				)
			}
		} finally {
			clearSecretChatBootstrapPending(groupId, chatId)
		}
	}

	const [createChat, { loading: isLoadingCreate }] = useCreateChatMutation({
		onError(error) {
			Toast.show({
				type: 'error',
				text1: t('createError'),
				text2: error.message || t('somethingWentWrong')
			})
		}
	})
	const isBusy = isLoadingCreate || isPickingAvatar || isUploadingAvatar

	const handlePickAvatar = async () => {
		try {
			setIsPickingAvatar(true)
			const result = await pickAvatarImage()
			if (result.canceled || !result.assets?.[0]) return
			setSelectedAvatar(result.assets[0])
		} finally {
			setIsPickingAvatar(false)
		}
	}

	const onSubmit = async (data: createChatSchemaType) => {
		const result = await createChat({
			variables: {
				groupId,
				data: {
					isGroup: true,
					chatName: data.chatName,
					userIds: data.userIds,
					isSecret: data.isSecretChat
				}
			}
		})

		const newChatId = result.data?.createChat?.id
		if (selectedAvatar && newChatId) {
			try {
				const avatarFile = createImageUploadFile(
					selectedAvatar,
					'chat-avatar.jpg'
				)
				await changeChatAvatar({
					variables: {
						chatId: newChatId,
						avatar: avatarFile
					},
					refetchQueries: [
						{
							query: FindAllChatsByGroupDocument,
							variables: {
								groupId,
								filters: {}
							}
						}
					],
					awaitRefetchQueries: true
				})
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: t('errorUpdatingAvatar'),
					text2: error instanceof Error ? error.message : undefined
				})
			}
		}

		if (data.isSecretChat && newChatId) {
			markSecretChatBootstrapPending(groupId, newChatId)
			void bootstrapSecretGroupChat(newChatId)
		}

		Toast.show({
			type: 'success',
			text1: t('chatCreated')
		})
		closeSheet(() => resetState())
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
		<AppModal
			visible={isOpen}
			animationType='none'
			transparent
			statusBarTranslucent
			navigationBarTranslucent
		>
			<View
				className='flex-1 justify-end'
				style={{
					paddingBottom: containerPaddingBottom
				}}
			>
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
					style={{
						transform: [{ translateY: slideAnim }],
						backgroundColor: colors.backgroundSecondary,
						borderTopLeftRadius: 24,
						borderTopRightRadius: 24,
						borderTopWidth: 1,
						borderColor: colors.border,
						height: sheetMaxHeight,
						paddingBottom: sheetPaddingBottom,
						overflow: 'hidden'
					}}
				>
					<View className='items-center pt-2 pb-1'>
						<View
							style={{
								width: 36,
								height: 4,
								borderRadius: 2,
								backgroundColor: colors.textMuted
							}}
						/>
					</View>

					{/* Header */}
					<View
						className='flex-row items-center justify-between px-5 pt-4 pb-3'
						style={{
							borderBottomWidth: 1,
							borderBottomColor: colors.border
						}}
					>
						<Text
							className='text-xl font-bold'
							style={{ color: colors.text }}
						>
							{t('newChat')}
						</Text>
						<TouchableOpacity
							onPress={() => closeSheet()}
							activeOpacity={0.6}
							className='w-9 h-9 rounded-full items-center justify-center'
							style={{ backgroundColor: colors.cardHover }}
						>
							<X size={18} color={colors.textSecondary} />
						</TouchableOpacity>
					</View>

					<View style={{ flex: 1, minHeight: 0 }}>
						<ScrollView
							style={{ flex: 1 }}
							contentContainerStyle={{
								paddingHorizontal: 20,
								paddingTop: 16,
								paddingBottom: 24
							}}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps='handled'
						>
							<View
								className='rounded-2xl px-4 py-4 mb-4'
								style={{
									backgroundColor: colors.cardHover,
									borderWidth: 1,
									borderColor: colors.borderLight
								}}
							>
								<View className='flex-row items-center'>
									<View
										style={{
											width: 72,
											height: 72,
											borderRadius: 36,
											overflow: 'hidden',
											backgroundColor:
												colors.backgroundTertiary,
											alignItems: 'center',
											justifyContent: 'center',
											marginRight: 16
										}}
									>
										{selectedAvatar?.uri ? (
											<Image
												source={{
													uri: selectedAvatar.uri
												}}
												resizeMode='cover'
												style={{
													width: '100%',
													height: '100%'
												}}
											/>
										) : (
											<Text
												style={{
													fontSize: 28,
													fontWeight: '700',
													color: colors.textSecondary
												}}
											>
												{form
													.watch('chatName')?.[0]
													?.toUpperCase() ?? 'C'}
											</Text>
										)}
									</View>

									<View style={{ flex: 1 }}>
										<TouchableOpacity
											activeOpacity={0.7}
											onPress={() =>
												void handlePickAvatar()
											}
											disabled={isBusy}
											className='rounded-xl px-4 py-3'
											style={{
												backgroundColor: colors.accent,
												opacity: isBusy ? 0.5 : 1
											}}
										>
											{isPickingAvatar ? (
												<ActivityIndicator
													size='small'
													color='#fff'
												/>
											) : (
												<Text
													className='text-sm font-semibold text-center'
													style={{ color: '#fff' }}
												>
													{selectedAvatar
														? t('changeAvatar')
														: t('uploadAvatar')}
												</Text>
											)}
										</TouchableOpacity>

										{selectedAvatar ? (
											<TouchableOpacity
												activeOpacity={0.7}
												onPress={() =>
													setSelectedAvatar(null)
												}
												disabled={isBusy}
												className='rounded-xl px-4 py-3 mt-2'
												style={{
													backgroundColor:
														colors.destructiveMuted,
													opacity: isBusy ? 0.5 : 1
												}}
											>
												<Text
													className='text-sm font-semibold text-center'
													style={{
														color: colors.destructive
													}}
												>
													{t('removeAvatar')}
												</Text>
											</TouchableOpacity>
										) : null}
									</View>
								</View>
							</View>

							{/* Chat name input */}
							<Controller
								control={form.control}
								name='chatName'
								render={({ field }) => (
									<TextInput
										className='rounded-xl px-4 py-3 mb-1'
										style={{
											borderWidth: 1,
											borderColor: form.formState.errors
												.chatName
												? colors.destructive
												: colors.borderLight,
											backgroundColor: colors.cardHover,
											color: colors.text,
											fontSize: 15
										}}
										placeholder={t('chatName')}
										placeholderTextColor={colors.textMuted}
										editable={!isLoadingCreate}
										value={field.value}
										onChangeText={field.onChange}
									/>
								)}
							/>
							{form.formState.errors.chatName?.message ? (
								<Text
									className='text-xs mb-3 ml-1'
									style={{ color: colors.destructive }}
								>
									{form.formState.errors.chatName.message}
								</Text>
							) : null}

							{/* Secret chat toggle */}
							<Controller
								control={form.control}
								name='isSecretChat'
								render={({ field }) => (
									<TouchableOpacity
										activeOpacity={0.7}
										onPress={() =>
											field.onChange(!field.value)
										}
										className='flex-row items-center rounded-xl px-4 py-3 mb-4'
										style={{
											backgroundColor: field.value
												? colors.accentMuted
												: colors.cardHover,
											borderWidth: 1,
											borderColor: field.value
												? colors.accent
												: colors.borderLight
										}}
									>
										<Lock
											size={18}
											color={
												field.value
													? colors.accent
													: colors.textMuted
											}
										/>
										<Text
											className='ml-3 text-sm font-medium'
											style={{
												color: field.value
													? colors.accent
													: colors.textSecondary
											}}
										>
											{t('secretChat')}
										</Text>
									</TouchableOpacity>
								)}
							/>

							{/* Users label */}
							<Text
								className='text-xs font-semibold uppercase tracking-wider mb-2 ml-1'
								style={{ color: colors.textMuted }}
							>
								{t('members')}{' '}
								{selectedUserIds.length > 0 && (
									<Text style={{ color: colors.accent }}>
										({selectedUserIds.length})
									</Text>
								)}
							</Text>

							{/* Users list */}
							{isLoadingFindGroup ? (
								<ActivityIndicator
									size='small'
									color={colors.accent}
									className='my-4'
								/>
							) : (
								<View className='mb-4'>
									{users.map(user => (
										<Controller
											key={user.user.id}
											control={form.control}
											name='userIds'
											render={({ field }) => {
												const isChecked =
													field.value.includes(
														user.user.id
													)
												return (
													<TouchableOpacity
														activeOpacity={0.7}
														onPress={() => {
															if (isChecked) {
																field.onChange(
																	field.value.filter(
																		(
																			id: string
																		) =>
																			id !==
																			user
																				.user
																				.id
																	)
																)
															} else {
																field.onChange([
																	...field.value,
																	user.user.id
																])
															}
														}}
														className='flex-row items-center rounded-xl px-3 py-2.5 mb-1'
														style={{
															backgroundColor:
																isChecked
																	? colors.accentMuted
																	: 'transparent'
														}}
													>
														<Checkbox
															checked={isChecked}
															onCheckedChange={(
																checked: boolean
															) => {
																if (checked) {
																	field.onChange(
																		[
																			...field.value,
																			user
																				.user
																				.id
																		]
																	)
																} else {
																	field.onChange(
																		field.value.filter(
																			(
																				id: string
																			) =>
																				id !==
																				user
																					.user
																					.id
																		)
																	)
																}
															}}
														/>
														<EntityAvatar
															name={
																user.user
																	.username
															}
															avatarUrl={
																user.user
																	.avatarUrl
															}
															size='sm'
														/>
														<Text
															className='ml-2 text-sm'
															style={{
																color: colors.text
															}}
														>
															{user.user.username}
														</Text>
													</TouchableOpacity>
												)
											}}
										/>
									))}
								</View>
							)}
							{form.formState.errors.userIds?.message ? (
								<Text
									className='text-xs mb-3 ml-1'
									style={{ color: colors.destructive }}
								>
									{form.formState.errors.userIds.message}
								</Text>
							) : null}

							{/* Submit */}
							<TouchableOpacity
								disabled={
									!form.formState.isValid ||
									isBusy ||
									isLoadingFindGroup
								}
								onPress={form.handleSubmit(onSubmit)}
								activeOpacity={0.8}
								className='rounded-xl py-3.5 items-center'
								style={{
									backgroundColor:
										!form.formState.isValid || isBusy
											? colors.borderLight
											: colors.accent,
									opacity:
										!form.formState.isValid || isBusy
											? 0.5
											: 1
								}}
							>
								{isLoadingCreate || isUploadingAvatar ? (
									<ActivityIndicator
										size='small'
										color='#fff'
									/>
								) : (
									<Text
										className='text-base font-semibold'
										style={{ color: '#fff' }}
									>
										{t('createChat')}
									</Text>
								)}
							</TouchableOpacity>
						</ScrollView>
					</View>
				</Animated.View>
			</View>
		</AppModal>
	)
}

export default CreateChatModal
