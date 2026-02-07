import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigation } from '@react-navigation/native'
import React, { FC, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	ActivityIndicator,
	Image,
	Modal,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import { Button } from '@/components/ui/button/Button'
import Checkbox from '@/components/ui/checkbox/Checkbox'

import {
	useFindAllChatsByUserQuery,
	useForwardChatMessageMutation
} from '@/graphql/generated/output'
import {
	ForwardMessageSchemaType,
	forwardMessageSchema
} from '@/schemas/chat/forward-message.schema'

interface ForwardMessageModalProp {
	handleAddForwarded: (messageIds: string[]) => void
	messageIds?: string[]
	handleClearMessagesId: () => void
	chatId: string
}

const ForwardMessageModal: FC<ForwardMessageModalProp> = ({
	messageIds,
	handleClearMessagesId,
	handleAddForwarded,
	chatId
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const navigation = useNavigation()

	const {
		data: dataChats,
		loading: isLoadingFindAllChatsByUser,
		refetch
	} = useFindAllChatsByUserQuery({
		skip: !isOpen,
		variables: {
			filters: {}
		}
	})

	const form = useForm<ForwardMessageSchemaType>({
		resolver: zodResolver(forwardMessageSchema),
		defaultValues: {
			text: '',
			targetChatsId: []
		}
	})

	const { isValid } = form.formState
	const chats = dataChats?.findAllChatsByUser ?? []

	const [forwardMessage, { loading: isLoadingForwardingMessage }] =
		useForwardChatMessageMutation({
			onCompleted() {
				setIsOpen(false)
				const selectedChats = form.getValues('targetChatsId')
				if (selectedChats.length === 1) {
					// @ts-ignore
					navigation.navigate('Chat', { chatId: selectedChats[0] })
				}
				Toast.show({
					type: 'success',
					text1: 'Message forwarded successfully'
				})
				form.reset()
			},
			onError(error) {
				Toast.show({
					type: 'error',
					text1: 'Error forwarding message',
					text2: error.message
				})
			}
		})

	const onSubmit = (data: ForwardMessageSchemaType) => {
		if (!messageIds || messageIds.length === 0) {
			Toast.show({
				type: 'error',
				text1: 'No messages selected to forward.'
			})
			return
		}

		if (data.targetChatsId.length === 0) {
			Toast.show({
				type: 'error',
				text1: 'You have to select at least one chat.'
			})
			return
		}

		if (data.text && data.text.trim() === '') {
			Toast.show({
				type: 'error',
				text1: 'Message text cannot be empty.'
			})
			return
		}

		if (
			data.targetChatsId.length === 1 &&
			data.targetChatsId[0] === chatId
		) {
			handleAddForwarded(messageIds)
			handleClearMessagesId()
			setIsOpen(false)
			return
		}

		forwardMessage({
			variables: {
				chatId,
				data: {
					forwardedMessageIds: messageIds,
					text: data.text.trim(),
					fileIds: [],
					targetChatsId: data.targetChatsId
				}
			}
		})

		handleClearMessagesId()
	}

	useEffect(() => {
		if (isOpen) refetch()
	}, [isOpen])

	return (
		<>
			<Button onPress={() => setIsOpen(true)}>Forward</Button>

			<Modal visible={isOpen} animationType='slide' transparent>
				<View className='flex-1 justify-center bg-black/50'>
					<View className='mx-4 bg-white rounded-2xl p-4 max-h-[80%]'>
						<Text className='text-xl font-semibold mb-3 text-center'>
							Forward messages
						</Text>

						{/* Input for text */}
						<Controller
							control={form.control}
							name='text'
							render={({ field }) => (
								<TextInput
									className='border border-gray-300 rounded-lg p-2 mb-3'
									placeholder='Enter message text'
									multiline
									editable={!isLoadingForwardingMessage}
									value={field.value}
									onChangeText={field.onChange}
								/>
							)}
						/>

						{/* Chats list */}
						{isLoadingFindAllChatsByUser ? (
							<ActivityIndicator size='small' className='my-3' />
						) : (
							<ScrollView className='max-h-[50vh]'>
								{chats.map(chat => (
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
															chat.avatarUrl ||
															'https://placehold.co/50'
													}}
													className='w-10 h-10 rounded-full ml-3'
												/>
												<View className='ml-3 flex-1'>
													<Text className='text-base font-medium'>
														{chat.chatName}
													</Text>
													<Text className='text-xs text-gray-500'>
														{chat.lastMessage?.text
															? `${chat.lastMessage.user.username}: ${chat.lastMessage.text}`
															: 'No messages'}
													</Text>
												</View>
											</TouchableOpacity>
										)}
									/>
								))}
							</ScrollView>
						)}

						{/* Submit button */}
						<Button
							onPress={form.handleSubmit(onSubmit)}
							disabled={
								!isValid ||
								isLoadingForwardingMessage ||
								isLoadingFindAllChatsByUser
							}
							className='mt-4'
						>
							Forward
						</Button>

						{/* Cancel */}
						<TouchableOpacity onPress={() => setIsOpen(false)}>
							<Text className='text-center text-red-500 mt-3 font-medium'>
								Cancel
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	)
}

export default ForwardMessageModal
