import { useRoute } from '@react-navigation/native'
import { Pin } from 'lucide-react-native'
import { FC, useCallback, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import DraggableFlatList, {
	RenderItemParams,
	ScaleDecorator
} from 'react-native-draggable-flatlist'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import ChatDropdownTrigger from './ChatDropdownTrigger'
import ChatsFloatingActions from './ChatsFloatingActions'
import ChatsListHeader from './ChatsListHeader'
import ChatsListSkeleton from './ChatsListSkeleton'
import CreateChatModal from './CreateChatModal'
import { useGroupChats } from './useGroupChats'
import {
	FindAllChatsByGroupQuery,
	GroupPermissionEnum,
	useGetMemberRoleQuery
} from '@/graphql/generated/output'

type RouteParams = {
	groupId: string
	groupName: string
}

type ChatItem = FindAllChatsByGroupQuery['findAllChatsByGroup'][0]

const ChatsList: FC = () => {
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const route = useRoute()
	const { groupId, groupName } = route.params as RouteParams

	const { colors } = useTheme()
	const { t } = useTranslation()

	const {
		allChats,
		pinnedChats,
		unpinnedChats,
		setAllChats,
		isLoadingFindAllChats,
		handleDeleteChat,
		handlePinChat,
		handleUnPinChat,
		handleReorderPinnedChats
	} = useGroupChats(groupId)

	const { data: currentRoleData, loading: isLoadingGetMemberRole } =
		useGetMemberRoleQuery({
			variables: { groupId },
			fetchPolicy: 'network-only'
		})

	const currentRole = currentRoleData?.getMemberRole

	const renderPinnedItem = useCallback(
		({ item, drag, isActive }: RenderItemParams<ChatItem>) => (
			<ScaleDecorator>
				<ChatDropdownTrigger
					groupId={groupId}
					chat={item}
					deleteChat={handleDeleteChat}
					onPinChat={handlePinChat}
					onUnPinChat={handleUnPinChat}
					onDrag={drag}
					isActive={isActive}
				/>
			</ScaleDecorator>
		),
		[groupId, handleDeleteChat, handlePinChat, handleUnPinChat]
	)

	if (isLoadingFindAllChats || isLoadingGetMemberRole) {
		return <ChatsListSkeleton />
	}

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			<ChatsListHeader
				groupId={groupId}
				groupName={groupName}
				chatCount={allChats.length}
			/>

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
							<ChatDropdownTrigger
								key={item.id}
								groupId={groupId}
								chat={item}
								deleteChat={handleDeleteChat}
								onPinChat={handlePinChat}
								onUnPinChat={handleUnPinChat}
							/>
						))}

						{allChats.length === 0 && (
							<View className='py-16 items-center'>
								<Text
									className='text-base'
									style={{ color: colors.textMuted }}
								>
									{t('noChats')}
								</Text>
							</View>
						)}
					</View>
				)}
			/>

			{(currentRole?.permissions.includes(
				GroupPermissionEnum.CreateChats
			) ||
				currentRole?.isCreator) && (
				<View>
					<ChatsFloatingActions
						groupId={groupId}
						onCreatePress={() => setIsCreateOpen(true)}
					/>

					<CreateChatModal
						setAllChats={setAllChats}
						groupId={groupId}
						isOpen={isCreateOpen}
						setIsOpen={setIsCreateOpen}
					/>
				</View>
			)}
		</View>
	)
}

export default ChatsList
