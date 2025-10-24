import { zodResolver } from '@hookform/resolvers/zod'
import React, { FC, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import { Button } from '@/components/ui/button/Button'
import Checkbox from '@/components/ui/checkbox/Checkbox'

import { useCurrentUser } from '@/hooks/useCurrentUser'

import { createSecretChat } from '@/utils/secret-chat/secretChat'

import {
	FindAllChatsByGroupQuery,
	FindAllUsersQuery,
	useCreateChatMutation,
	useFindAllUsersQuery
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
}

const CreateChatModal: FC<CreateChatModalProp> = ({ groupId, setAllChats }) => {
	const [isOpen, setIsOpen] = useState(false)

	const {
		data,
		loading: isLoadingFindAllUsers,
		refetch
	} = useFindAllUsersQuery({
		skip: !isOpen
	})

	const form = useForm<createChatSchemaType>({
		resolver: zodResolver(createChatSchema),
		defaultValues: {
			chatName: '',
			userIds: []
		}
	})
	const { user } = useCurrentUser()

	const users = data?.findAllUsers ?? []

	const [createChat, { loading: isLoadingCreate }] = useCreateChatMutation({
		onCompleted() {
			Toast.show({
				type: 'success',
				text1: 'Chat created successfully!'
			})
			setIsOpen(false)
			form.reset()
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: 'Error creating chat',
				text2: error.message || 'Something went wrong'
			})
		}
	})

	const onSubmit = (data: createChatSchemaType) => {
		if (data.isSecretChat) {
			const secretUsers: FindAllUsersQuery['findAllUsers'] = []
			users.forEach(user => {
				if (data.userIds.includes(user.id)) {
					secretUsers.push(user)
				}
			})
			if (user) {
				secretUsers.push(user)
			}
			createSecretChat(data.chatName, secretUsers)
				.then(chat => {
					setAllChats(prevAllChats => [chat, ...(prevAllChats ?? [])])
					Toast.show({
						type: 'success',
						text1: 'Chat created successfully!'
					})
				})
				.catch(error => {
					Toast.show({
						type: 'error',
						text1: 'Error creating chat',
						text2: error.message || 'Something went wrong'
					})
				})
		}
		createChat({
			variables: {
				groupId,
				data: {
					chatName: data.chatName,
					userIds: data.userIds
				}
			}
		})
	}

	return (
		<>
			<Button onPress={() => setIsOpen(true)}>Create chat</Button>

			<Modal visible={isOpen} animationType='slide' transparent>
				<View className='flex-1 justify-center bg-foreground'>
					<View className='m-5 bg-foreground-dark rounded-sm p-4 max-h-[80%]'>
						<Text className='text-lg font-bold mb-3'>
							Create chat
						</Text>
						<Controller
							control={form.control}
							name='isSecretChat'
							render={({ field }) => (
								<View className=' flex-row items-center mb-2'>
									<Checkbox
										checked={!!field.value}
										onCheckedChange={field.onChange}
									/>
									<Text className='ml-2'>
										Do you want to make it a secret chat?
									</Text>
								</View>
							)}
						/>
						<Controller
							control={form.control}
							name='chatName'
							render={({ field }) => (
								<TextInput
									className='border border-fuchsia-50 rounded-lg p-2 mb-3'
									placeholder='Enter chat name'
									editable={!isLoadingCreate}
									value={field.value}
									onChangeText={field.onChange}
								/>
							)}
						/>

						{isLoadingFindAllUsers ? (
							<ActivityIndicator size='small' />
						) : (
							<ScrollView className='mb-4 max-h-52'>
								{users.map(user => (
									<Controller
										key={user.id}
										control={form.control}
										name='userIds'
										render={({ field }) => (
											<View className='flex-row items-center mb-2'>
												<Checkbox
													checked={field.value.includes(
														user.id
													)}
													onCheckedChange={(
														checked: boolean
													) => {
														if (checked) {
															field.onChange([
																...field.value,
																user.id
															])
														} else {
															field.onChange(
																field.value.filter(
																	(
																		id: string
																	) =>
																		id !==
																		user.id
																)
															)
														}
													}}
												/>

												<Text className='ml-2'>
													{user.username}
												</Text>
											</View>
										)}
									/>
								))}
							</ScrollView>
						)}
						<Button
							disabled={
								!form.formState.isValid ||
								isLoadingCreate ||
								isLoadingFindAllUsers
							}
							onPress={form.handleSubmit(onSubmit)}
						>
							Submit
						</Button>
						<TouchableOpacity
							onPress={() => setIsOpen(false)}
							className='mt-3'
						>
							<Text className='text-center text-red-600'>
								Cancel
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	)
}

export default CreateChatModal
