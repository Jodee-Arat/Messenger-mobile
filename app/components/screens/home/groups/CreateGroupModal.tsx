import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react-native'
import { FC, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import EntityAvatar from '@/components/ui/EntityAvatar'
import Checkbox from '@/components/ui/checkbox/Checkbox'

import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useUser } from '@/hooks/useUser'

import {
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

const CreateGroupModal: FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { userId } = useUser()

	const {
		data: friendsData,
		loading: isLoadingUsers,
		refetch: refetchFriends
	} = useGetFriendsQuery({ skip: !isOpen, fetchPolicy: 'cache-and-network' })

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
		onCompleted() {
			Toast.show({ type: 'success', text1: t('groupCreated') })
			onClose()
			form.reset()
		},
		onError(err) {
			Toast.show({
				type: 'error',
				text1: t('createError'),
				text2: err.message
			})
		}
	})

	useEffect(() => {
		if (isOpen) refetchFriends()
	}, [isOpen])

	const selectedUserIds = form.watch('userIds')

	return (
		<Modal
			visible={isOpen}
			animationType='slide'
			transparent
			onRequestClose={onClose}
		>
			<View
				className='flex-1 justify-end'
				style={{ backgroundColor: colors.overlay }}
			>
				<View
					style={{
						backgroundColor: colors.backgroundSecondary,
						borderTopLeftRadius: 24,
						borderTopRightRadius: 24,
						borderTopWidth: 1,
						borderColor: colors.border,
						maxHeight: '80%'
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
							onPress={onClose}
							activeOpacity={0.6}
							className='w-9 h-9 rounded-full items-center justify-center'
							style={{ backgroundColor: colors.cardHover }}
						>
							<X size={18} color={colors.textSecondary} />
						</TouchableOpacity>
					</View>

					<View className='px-5 pt-4 pb-6'>
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
							<ScrollView
								style={{ maxHeight: 220 }}
								showsVerticalScrollIndicator={false}
							>
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
							</ScrollView>
						)}

						<TouchableOpacity
							disabled={!form.formState.isValid || isCreating}
							onPress={form.handleSubmit(data =>
								createGroup({
									variables: {
										data: {
											groupName: data.groupName,
											userIds: data.userIds
										}
									}
								})
							)}
							activeOpacity={0.8}
							className='rounded-xl py-3.5 items-center mt-4'
							style={{
								backgroundColor:
									!form.formState.isValid || isCreating
										? 'hsl(260, 30%, 30%)'
										: colors.accent,
								opacity:
									!form.formState.isValid || isCreating
										? 0.5
										: 1
							}}
						>
							{isCreating ? (
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
					</View>
				</View>
			</View>
		</Modal>
	)
}

export default CreateGroupModal
