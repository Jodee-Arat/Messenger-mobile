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

import Layout from '@/components/layout/Layout'
import Loader from '@/components/ui/Loader'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'

import {
	deleteSecretChat,
	loadAllSecretChats
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
	const navigation = useTypedNavigation()
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
		const fetchChats = async () => {
			const secretChats = await loadAllSecretChats()
			if (secretChats.find(chat => chat.id === chatId)) {
				deleteSecretChat(groupId, chatId)
			} else {
				deleteChat({
					variables: {
						chatId
					}
				})
			}

			setAllChats(prevAllChats =>
				prevAllChats.filter(chat => chat.id !== chatId)
			)
		}
		fetchChats()
	}

	useEffect(() => {
		const fetchChats = async () => {
			const secretChats = await loadAllSecretChats()

			if (!allChatsData?.findAllChatsByGroup) {
				setAllChats(secretChats || [])
				return
			}

			const allChatsStart = [
				...allChatsData.findAllChatsByGroup,
				...(secretChats || [])
			]

			const sortAllChatsStart = allChatsStart.sort(
				(a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
			)

			setAllChats(sortAllChatsStart)
		}

		fetchChats()
	}, [allChatsData])

	useEffect(() => {
		if (!newChatData || !newChatData.chatAdded) return

		setAllChats(prevChats => [newChatData.chatAdded, ...prevChats])
	}, [newChatData])

	useEffect(() => {
		if (!deletedChatData || !deletedChatData.chatDeleted) return

		setAllChats(prevChats =>
			prevChats.filter(chat => chat.id !== deletedChatData.chatDeleted.id)
		)
	}, [deletedChatData])

	useEffect(() => {
		if (!updateChatData || !updateChatData.chatUpdated) return

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
			</ScrollView>
		</View>
	)
}

export default ChatsList
