import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, X } from 'lucide-react-native'
import React, { FC, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	ActivityIndicator,
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
import EntityAvatar from '@/components/ui/EntityAvatar'
import { Button } from '@/components/ui/button/Button'
import Checkbox from '@/components/ui/checkbox/Checkbox'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useBottomSheetModalLayout } from '@/hooks/useModalLayout'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { initGroupSessionAction } from '@/hooks/useSecretChat.actions'

import {
	createMyKey,
	createSecretChat,
	loadMyPreKeyJSON
} from '@/utils/secret-chat/secretChat'

import {
	FindAllChatsByGroupQuery,
	useCreateChatMutation,
	useFindAllUsersQuery,
	useFindChatByChatIdLazyQuery,
	useFindGroupByGroupIdQuery,
	useGetPreKeysLazyQuery,
	useSendSharedSecretKeyMutation
} from '@/graphql/generated/output'
import {
	createChatSchema,
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

const SCREEN_HEIGHT = Dimensions.get('window').height

const CreateChatModal: FC<CreateChatModalProp> = ({
	groupId,
	setAllChats,
	isOpen,
	setIsOpen
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { containerPaddingBottom, sheetMaxHeight, sheetPaddingBottom } =
		useBottomSheetModalLayout(0.85)
		
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
		resolver: zodResolver(createChatSchema),
		mode: 'onChange',
		defaultValues: {
			chatName: '',
			userIds: []
		}
	})

	const users = (data?.findGroupByGroupId?.members ?? []).filter(
		m => m.user.id !== currentUser?.id
	)
	const selectedUserIds = form.watch('userIds')
	const isSecret = form.watch('isSecretChat')
	const [getPreKeys] = useGetPreKeysLazyQuery({
		fetchPolicy: 'network-only'
	})
	const [findChatById] = useFindChatByChatIdLazyQuery({
		fetchPolicy: 'network-only'
	})
	const [sendSharedSecretKey] = useSendSharedSecretKeyMutation()

	const bootstrapSecretGroupChat = async (chatId: string) => {
		if (!currentUser?.id) return

		const myPreKeys = await loadMyPreKeyJSON()
		if (!myPreKeys) {
			console.warn(
				'[SecretChat][CreateChat] local prekeys missing, skip bootstrap'
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
		const preKeys = preKeysResponse.data?.getPreKeys ?? []
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

		console.log(
			'[SecretChat][CreateChat] creator bootstrap finished for chat',
			chatId
		)
	}

	const [createChat, { loading: isLoadingCreate }] = useCreateChatMutation({
		onCompleted() {
			Toast.show({
				type: 'success',
				text1: t('chatCreated')
			})
			closeSheet(() => form.reset())
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: t('createError'),
				text2: error.message || 'Something went wrong'
			})
		}
	})

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
		if (data.isSecretChat && newChatId) {
			void bootstrapSecretGroupChat(newChatId)
		}
	}

	useEffect(() => {
		if (isOpen) {
			refetch()
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		}
	}, [isOpen])

	return (
		<AppModal visible={isOpen} animationType='none' transparent>
			<View
				className='flex-1 justify-end'
				style={{
					paddingBottom: containerPaddingBottom
				}}
			>
				<Pressable
					className='flex-1'
					style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }}
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
						maxHeight: sheetMaxHeight,
						paddingBottom: sheetPaddingBottom
					}}
				>
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

					<View className='px-5 pt-4 pb-6'>
						{/* Chat name input */}
						<Controller
							control={form.control}
							name='chatName'
							render={({ field }) => (
								<TextInput
									className='rounded-xl px-4 py-3 mb-3'
									style={{
										borderWidth: 1,
										borderColor: colors.borderLight,
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

						{/* Secret chat toggle */}
						<Controller
							control={form.control}
							name='isSecretChat'
							render={({ field }) => (
								<TouchableOpacity
									activeOpacity={0.7}
									onPress={() => field.onChange(!field.value)}
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
							<ScrollView
								className='mb-4'
								style={{ maxHeight: 240 }}
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps='handled'
							>
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
																field.onChange([
																	...field.value,
																	user.user.id
																])
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
															user.user.username
														}
														avatarUrl={
															user.user.avatarUrl
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
							</ScrollView>
						)}

						{/* Submit */}
						<TouchableOpacity
							disabled={
								!form.formState.isValid ||
								isLoadingCreate ||
								isLoadingFindGroup
							}
							onPress={form.handleSubmit(onSubmit)}
							activeOpacity={0.8}
							className='rounded-xl py-3.5 items-center'
							style={{
								backgroundColor:
									!form.formState.isValid || isLoadingCreate
										? colors.borderLight
										: colors.accent,
								opacity:
									!form.formState.isValid || isLoadingCreate
										? 0.5
										: 1
							}}
						>
							{isLoadingCreate ? (
								<ActivityIndicator size='small' color='#fff' />
							) : (
								<Text
									className='text-base font-semibold'
									style={{ color: '#fff' }}
								>
									{t('createChat')}
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		</AppModal>
	)
}

export default CreateChatModal
