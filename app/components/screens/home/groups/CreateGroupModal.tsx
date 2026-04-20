import { zodResolver } from '@hookform/resolvers/zod'
import type { ImagePickerAsset } from 'expo-image-picker'
import { X } from 'lucide-react-native'
import { FC, useEffect, useRef, useMemo, useState } from 'react'
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
import EntityAvatar from '@/components/ui/EntityAvatar'
import Checkbox from '@/components/ui/checkbox/Checkbox'

import { useBottomSheetModalLayout } from '@/hooks/useModalLayout'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useUser } from '@/hooks/useUser'

import { pickAvatarImage } from '@/utils/avatar-image-picker'
import { createImageUploadFile } from '@/utils/create-image-upload-file'

import {
	FindAllGroupsByUserDocument,
	useChangeGroupAvatarMutation,
	useCreateGroupMutation,
	useGetFriendsQuery
} from '@/graphql/generated/output'
import {
	createGroupSchema,
	createGroupSchemaType
} from '@/schemas/group/create-group.schema'

interface CreateGroupModalProps {
	isOpen: boolean
	onClose: () => void
}

const SCREEN_HEIGHT = Dimensions.get('window').height

const CreateGroupModal: FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { containerPaddingBottom, sheetMaxHeight, sheetPaddingBottom } =
		useBottomSheetModalLayout(0.8)
	const { userId } = useUser()
	const [selectedAvatar, setSelectedAvatar] = useState<ImagePickerAsset | null>(
		null
	)
	const [isPickingAvatar, setIsPickingAvatar] = useState(false)

	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current

	const resetState = () => {
		form.reset({ groupName: '', userIds: [] })
		setSelectedAvatar(null)
	}

	const closeSheet = (cb?: () => void) => {
		Animated.timing(slideAnim, {
			toValue: SCREEN_HEIGHT,
			duration: 200,
			useNativeDriver: true
		}).start(() => {
			onClose()
			cb?.()
		})
	}

	const {
		data: friendsData,
		loading: isLoadingUsers,
		refetch: refetchFriends
	} = useGetFriendsQuery({
		skip: !isOpen || !userId,
		fetchPolicy: 'network-only'
	})

	const friends = useMemo(() => {
		if (!friendsData?.getFriends) return []
		return friendsData.getFriends
			.map(f => {
				const other = f.userId === userId ? f.friend : f.user
				return other
					? {
							id: other.id,
							username: other.username,
							avatarUrl: other.avatarUrl
						}
					: null
			})
			.filter(Boolean) as {
			id: string
			username: string
			avatarUrl?: string | null
		}[]
	}, [friendsData, userId])

	const form = useForm<createGroupSchemaType>({
		resolver: zodResolver(createGroupSchema),
		mode: 'onChange',
		defaultValues: { groupName: '', userIds: [] }
	})

	const [createGroup, { loading: isCreating }] = useCreateGroupMutation({
		onError(err) {
			Toast.show({
				type: 'error',
				text1: t('createError'),
				text2: err.message
			})
		}
	})
	const [changeGroupAvatar, { loading: isUploadingAvatar }] =
		useChangeGroupAvatarMutation()

	useEffect(() => {
		if (isOpen) {
			refetchFriends()
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		}
	}, [isOpen])

	const selectedUserIds = form.watch('userIds')
	const isBusy = isCreating || isPickingAvatar || isUploadingAvatar

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

	const handleSubmit = async (data: createGroupSchemaType) => {
		const result = await createGroup({
			variables: {
				data: {
					groupName: data.groupName,
					userIds: data.userIds
				}
			}
		})

		const createdGroupId = result.data?.createGroup?.id
		if (selectedAvatar && createdGroupId) {
			try {
				const avatarFile = createImageUploadFile(
					selectedAvatar,
					'group-avatar.jpg'
				)
				await changeGroupAvatar({
					variables: {
						groupId: createdGroupId,
						avatar: avatarFile
					},
					refetchQueries: [FindAllGroupsByUserDocument],
					awaitRefetchQueries: true
				})
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: t('errorUpdatingAvatar'),
					text2:
						error instanceof Error
							? error.message
							: undefined
				})
			}
		}

		Toast.show({ type: 'success', text1: t('groupCreated') })
		closeSheet(() => resetState())
	}

	return (
		<AppModal
			visible={isOpen}
			animationType='none'
			transparent
			statusBarTranslucent
			navigationBarTranslucent
			onRequestClose={() => closeSheet()}
		>
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
						paddingBottom: sheetPaddingBottom,
						overflow: 'hidden'
					}}
				>
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
							{t('newGroup')}
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
												.watch('groupName')
												?.[0]
												?.toUpperCase() ?? 'G'}
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

						<Controller
							control={form.control}
							name='groupName'
							render={({ field }) => (
								<TextInput
									className='rounded-xl px-4 py-3 mb-4'
									style={{
										borderWidth: 1,
										borderColor: colors.borderLight,
										backgroundColor: colors.cardHover,
										color: colors.text,
										fontSize: 15
									}}
									placeholder={t('groupNamePlaceholder')}
									placeholderTextColor={colors.textMuted}
									editable={!isCreating}
									value={field.value}
									onChangeText={field.onChange}
								/>
							)}
						/>

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

						{isLoadingUsers ? (
							<ActivityIndicator
								size='small'
								color={colors.accent}
								className='my-4'
							/>
						) : friends.length === 0 ? (
							<Text
								className='text-sm text-center my-4'
								style={{ color: colors.textMuted }}
							>
								{t('noFriendsForGroup')}
							</Text>
						) : (
							<View>
								{friends.map(u => (
									<Controller
										key={u.id}
										control={form.control}
										name='userIds'
										render={({ field }) => {
											const checked =
												field.value.includes(u.id)
											return (
												<TouchableOpacity
													activeOpacity={0.7}
													onPress={() =>
														checked
															? field.onChange(
																	field.value.filter(
																		(
																			id: string
																		) =>
																			id !==
																			u.id
																	)
																)
															: field.onChange([
																	...field.value,
																	u.id
																])
													}
													className='flex-row items-center rounded-xl px-3 py-2.5 mb-1'
													style={{
														backgroundColor: checked
															? colors.accentMuted
															: 'transparent'
													}}
												>
													<Checkbox
														checked={checked}
														onCheckedChange={(
															c: boolean
														) =>
															c
																? field.onChange(
																		[
																			...field.value,
																			u.id
																		]
																	)
																: field.onChange(
																		field.value.filter(
																			(
																				id: string
																			) =>
																				id !==
																				u.id
																		)
																	)
														}
													/>
													<EntityAvatar
														name={u.username}
														avatarUrl={u.avatarUrl}
														size='sm'
													/>
													<Text
														className='ml-2 text-sm'
														style={{
															color: colors.text
														}}
													>
														{u.username}
													</Text>
												</TouchableOpacity>
											)
										}}
									/>
								))}
							</View>
						)}

						<TouchableOpacity
							disabled={!form.formState.isValid || isBusy}
							onPress={form.handleSubmit(handleSubmit)}
							activeOpacity={0.8}
							className='rounded-xl py-3.5 items-center mt-4'
							style={{
								backgroundColor:
									!form.formState.isValid || isBusy
										? 'hsl(260, 30%, 30%)'
										: colors.accent,
								opacity:
									!form.formState.isValid || isBusy
										? 0.5
										: 1
							}}
						>
							{isCreating || isUploadingAvatar ? (
								<ActivityIndicator size='small' color='#fff' />
							) : (
								<Text
									className='text-base font-semibold'
									style={{ color: '#fff' }}
								>
									{t('createGroup')}
								</Text>
							)}
						</TouchableOpacity>
					</ScrollView>
				</Animated.View>
			</View>
		</AppModal>
	)
}

export default CreateGroupModal
