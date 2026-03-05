import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, X } from 'lucide-react-native'
import React, { FC, useEffect, useState } from 'react'
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
import { Button } from '@/components/ui/button/Button'
import Checkbox from '@/components/ui/checkbox/Checkbox'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTheme, useTranslation } from '@/hooks/useTheme'

import { createSecretChat } from '@/utils/secret-chat/secretChat'

import {
	FindAllChatsByGroupQuery,
	useCreateChatMutation,
	useFindAllUsersQuery,
	useFindGroupByGroupIdQuery,
	useGetPreKeysLazyQuery
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

const CreateChatModal: FC<CreateChatModalProp> = ({
	groupId,
	setAllChats,
	isOpen,
	setIsOpen
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
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

	const [createChat, { loading: isLoadingCreate }] = useCreateChatMutation({
		onCompleted() {
			Toast.show({
				type: 'success',
				text1: t('chatCreated')
			})
			setIsOpen(false)
			form.reset()
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: t('createError'),
				text2: error.message || 'Something went wrong'
			})
		}
	})

	const onSubmit = (data: createChatSchemaType) => {
		createChat({
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
	}

	useEffect(() => {
		if (isOpen) refetch()
	}, [isOpen])

	return (
		<Modal visible={isOpen} animationType='slide' transparent>
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
						maxHeight: '85%'
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
							onPress={() => setIsOpen(false)}
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
				</View>
			</View>
		</Modal>
	)
}

export default CreateChatModal
