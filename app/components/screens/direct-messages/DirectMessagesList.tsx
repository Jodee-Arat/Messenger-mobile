import { Pin, Users } from 'lucide-react-native'
import { FC, useCallback } from 'react'
import { FlatList, Text, View } from 'react-native'
import DraggableFlatList, {
	RenderItemParams,
	ScaleDecorator
} from 'react-native-draggable-flatlist'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import ChatsListSkeleton from '../chats-list/ChatsListSkeleton'

import DMChatDropdownTrigger from './DMChatDropdownTrigger'
import { useDirectChats } from './useDirectChats'
import { FindAllChatsByUserQuery } from '@/graphql/generated/output'

type ChatItem = FindAllChatsByUserQuery['findAllChatsByUser'][0]

const DirectMessagesList: FC = () => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	const {
		allChats,
		pinnedChats,
		unpinnedChats,
		isLoadingChats,
		handleDeleteChat,
		handlePinChat,
		handleUnPinChat,
		handleReorderPinnedChats
	} = useDirectChats()

	const renderPinnedItem = useCallback(
		({ item, drag, isActive }: RenderItemParams<ChatItem>) => (
			<ScaleDecorator>
				<DMChatDropdownTrigger
					chat={item}
					deleteChat={handleDeleteChat}
					onPinChat={handlePinChat}
					onUnPinChat={handleUnPinChat}
					onDrag={drag}
					isActive={isActive}
				/>
			</ScaleDecorator>
		),
		[handleDeleteChat, handlePinChat, handleUnPinChat]
	)

	if (isLoadingChats) {
		return <ChatsListSkeleton />
	}

	return (
		<FlatList
			data={[{ key: 'content' }]}
			keyExtractor={item => item.key}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
			renderItem={() => (
				<View>
					{/* ── Pinned Section (Draggable) ── */}
					{pinnedChats.length > 0 && (
						<View>
							<View className='flex-row items-center px-4 py-2'>
								<Pin
									size={14}
									color={colors.accent}
									style={{ marginRight: 6 }}
								/>
								<Text
									className='text-xs font-semibold uppercase tracking-wider'
									style={{ color: colors.textMuted }}
								>
									{t('pinnedChats') || 'Закреплённые'}
								</Text>
							</View>
							<DraggableFlatList
								data={pinnedChats}
								keyExtractor={item => item.id}
								renderItem={renderPinnedItem}
								onDragEnd={({ data }) =>
									handleReorderPinnedChats(data)
								}
								scrollEnabled={false}
							/>
							<View
								className='mx-4 my-1'
								style={{
									height: 1,
									backgroundColor: colors.borderLight
								}}
							/>
						</View>
					)}

					{/* ── Unpinned Section ── */}
					{unpinnedChats.map(item => (
						<DMChatDropdownTrigger
							key={item.id}
							chat={item}
							deleteChat={handleDeleteChat}
							onPinChat={handlePinChat}
							onUnPinChat={handleUnPinChat}
						/>
					))}

					{allChats.length === 0 && (
						<View className='py-16 items-center px-8'>
							<Users size={48} color={colors.borderLight} />
							<Text
								className='text-base font-semibold mt-4 text-center'
								style={{ color: colors.textMuted }}
							>
								{t('noDirectMessages')}
							</Text>
							<Text
								className='text-xs mt-2 text-center'
								style={{ color: colors.textMuted }}
							>
								{t('addFriendsHint')}
							</Text>
						</View>
					)}
				</View>
			)}
		/>
	)
}

export default DirectMessagesList
