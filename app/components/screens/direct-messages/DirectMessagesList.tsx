import { Users } from 'lucide-react-native'
import { FC } from 'react'
import { Text, View } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import ChatsListSkeleton from '../chats-list/ChatsListSkeleton'

import DMChatDropdownTrigger from './DMChatDropdownTrigger'
import { useDirectChats } from './useDirectChats'

interface DirectMessagesListProps {
	searchQuery: string
}

const DirectMessagesList: FC<DirectMessagesListProps> = ({ searchQuery }) => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	const {
		allChats,
		pinnedChats,
		isLoadingChats,
		isRefreshingChats,
		handleRefreshChats,
		handleDeleteChat,
		handlePinChat,
		handleUnPinChat,
		handleReorderPinnedChats
	} = useDirectChats(searchQuery)

	if (isLoadingChats && allChats.length === 0) {
		return <ChatsListSkeleton />
	}

	const isSearching = searchQuery.trim().length > 0

	return (
		<DraggableFlatList
			data={allChats}
			keyExtractor={item => item.id}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
			refreshing={isRefreshingChats}
			onRefresh={() => void handleRefreshChats()}
			onDragEnd={({ data }) => {
				const reorderedPinned = data.filter(chat => chat.isPinned)
				if (reorderedPinned.length > 1) {
					void handleReorderPinnedChats(reorderedPinned)
				}
			}}
			ListEmptyComponent={
				<View className='py-16 items-center px-8'>
					<Users size={48} color={colors.borderLight} />
					<Text
						className='text-base font-semibold mt-4 text-center'
						style={{ color: colors.textMuted }}
					>
						{isSearching
							? t('noSearchResults')
							: t('noDirectMessages')}
					</Text>
					<Text
						className='text-xs mt-2 text-center'
						style={{ color: colors.textMuted }}
					>
						{isSearching
							? t('tryDifferentQuery')
							: t('addFriendsHint')}
					</Text>
				</View>
			}
			renderItem={({ item, drag, isActive }) => (
				<DMChatDropdownTrigger
					key={item.id}
					chat={item}
					deleteChat={handleDeleteChat}
					onPinChat={handlePinChat}
					onUnPinChat={handleUnPinChat}
					onDrag={
						item.isPinned && pinnedChats.length > 1
							? drag
							: undefined
					}
					isActive={isActive}
				/>
			)}
		/>
	)
}

export default DirectMessagesList
