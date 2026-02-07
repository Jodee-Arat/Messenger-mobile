import { useNavigation, useRoute } from '@react-navigation/native'
import { FC, useEffect, useState } from 'react'
import {
	FlatList,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import Loader from '@/components/ui/Loader'
import { Button } from '@/components/ui/button/Button'

import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'

import {
	createSecretChat,
	deleteSecretChat,
	loadAllSecretChats,
	updateSecretChatUpdatedAt
} from '@/utils/secret-chat/secretChat'

import ChatDropdownTrigger from './ChatDropdownTrigger'
import CreateChatModal from './CreateChatModal'
import {
	FindAllChatsByGroupQuery,
	useChatAddedSubscription,
	useChatDeletedSubscription,
	useChatUpdatedSubscription,
	useDeleteChatMutation,
	useFindAllChatsByGroupQuery
} from '@/graphql/generated/output'

type RouteParams = {
	groupId: string
	groupName: string
}

const ChatsList: FC = () => {
	const [allChats, setAllChats] = useState<
		FindAllChatsByGroupQuery['findAllChatsByGroup']
	>([])
	const route = useRoute()
	const { groupId, groupName } = route.params as RouteParams

	const { userId } = useUser()

	const { data: allChatsData, loading: isLoadingFindAllChats } =
		useFindAllChatsByGroupQuery({
			variables: {
				filters: {},
				groupId
			},
			fetchPolicy: 'network-only'
		})

	const { data: newChatData } = useChatAddedSubscription({
		variables: { userId, groupId },
		skip: !(userId && groupId)
	})

	const { data: deletedChatData } = useChatDeletedSubscription({
		variables: { userId, groupId },
		skip: !(userId && groupId)
	})
	// это надо переписать и добавить на сервер в secret update
	const { data: updateChatData } = useChatUpdatedSubscription({
		variables: { userId },
		skip: !(userId && groupId)
	})

	const [deleteChat, { loading: isLoadingDeleteChat }] =
		useDeleteChatMutation({
			onCompleted() {
				Toast.show({
					type: 'success',
					text1: 'Chat deleted successfully.'
				})
			},
			onError(error) {
				Toast.show({
					type: 'error',
					text1: 'Failed to delete chat',
					text2: error.message || 'Something went wrong'
				})
			}
		})

	const handleDeleteChat = (chatId: string) => {
		deleteChat({
			variables: {
				chatId
			}
		})
	}

	useEffect(() => {
		if (!allChatsData || !allChatsData.findAllChatsByGroup) return

		setAllChats(allChatsData.findAllChatsByGroup)
	}, [allChatsData])

	useEffect(() => {
		if (!newChatData || !newChatData.chatAdded) return

		const addNewChat = async () => {
			try {
				if (newChatData.chatAdded.isSecret) {
					await createSecretChat(newChatData.chatAdded)
				}

				setAllChats(prevChats => [newChatData.chatAdded, ...prevChats])
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: 'Failed to create chat',
					text2: String(error || '') || 'Something went wrong'
				})
			}
		}

		addNewChat()
	}, [newChatData])

	useEffect(() => {
		if (!deletedChatData || !deletedChatData.chatDeleted) return

		const deleteChat = async () => {
			try {
				await deleteSecretChat(groupId, deletedChatData.chatDeleted.id)
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: 'Failed to delete chat',
					text2: String(error || '') || 'Something went wrong'
				})
			}
		}

		if (deletedChatData.chatDeleted.isSecret) {
			deleteChat()
		}

		setAllChats(prevChats =>
			prevChats.filter(chat => chat.id !== deletedChatData.chatDeleted.id)
		)
	}, [deletedChatData])

	useEffect(() => {
		if (!updateChatData || !updateChatData.chatUpdated) return
		const updateChat = async () => {
			try {
				await updateSecretChatUpdatedAt(
					groupId,
					updateChatData.chatUpdated.id
				)
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: 'Failed to update chat',
					text2: String(error || '') || 'Something went wrong'
				})
			}
		}
		if (updateChatData.chatUpdated.isSecret) {
			updateChat()
		}

		setAllChats(prevChats => [updateChatData.chatUpdated, ...prevChats])
	}, [updateChatData])

	if (isLoadingFindAllChats) {
		return <Loader />
	}

	return (
		<View className='flex-1 py-2'>
			<Text className='text-center text-3xl text-foreground-dark mt-10'>
				Chats of {groupName}
			</Text>
			<ScrollView className='py-5' showsVerticalScrollIndicator={false}>
				{allChats.map((chat, index) => (
					<ChatDropdownTrigger
						groupId={groupId}
						chat={chat}
						key={index}
						deleteChat={handleDeleteChat}
					/>
				))}
				{!isLoadingFindAllChats && (
					<CreateChatModal
						setAllChats={setAllChats}
						groupId={groupId}
					/>
				)}
				<Button onPress={async () => await loadAllSecretChats(groupId)}>
					loadAll
				</Button>
			</ScrollView>
		</View>
	)
}

export default ChatsList
