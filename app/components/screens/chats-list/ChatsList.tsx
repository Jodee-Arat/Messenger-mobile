import { useFocusEffect, useRoute } from '@react-navigation/native'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme, useTranslation } from '@/hooks/useTheme'
import {
	isGroupMembershipRevokedError
} from '@/hooks/useBlockedUsers'
import { useUser } from '@/hooks/useUser'
import { resetToHome } from '@/navigation/navigate'

import ChatDropdownTrigger from './ChatDropdownTrigger'
import ChatsFloatingActions from './ChatsFloatingActions'
import ChatsListHeader from './ChatsListHeader'
import ChatsListSkeleton from './ChatsListSkeleton'
import CreateChatModal from './CreateChatModal'
import { useGroupChats } from './useGroupChats'
import {
	GroupPermissionEnum,
	useGroupDeletedSubscription,
	useFindGroupByGroupIdQuery,
	useGetMemberRoleQuery
} from '@/graphql/generated/output'

type RouteParams = {
	groupId: string
	groupName: string
}

const SEARCH_DEBOUNCE_MS = 500

const ChatsList: FC = () => {
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [isSearchVisible, setIsSearchVisible] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const route = useRoute()
	const { groupId, groupName } = route.params as RouteParams
	const { userId } = useUser()
	const handledAccessLossRef = useRef(false)

	const { colors } = useTheme()
	const { t } = useTranslation()
	const { bottom } = useSafeAreaInsets()

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery)
		}, SEARCH_DEBOUNCE_MS)
		return () => clearTimeout(timer)
	}, [searchQuery])

	const {
		data: groupData,
		error: groupError,
		refetch: refetchGroup
	} = useFindGroupByGroupIdQuery({
		variables: { groupId },
		fetchPolicy: 'network-only'
	})

	const {
		allChats,
		pinnedChats,
		setAllChats,
		isLoadingFindAllChats,
		isRefreshingChats,
		handleRefreshChats,
		handleDeleteChat,
		handlePinChat,
		handleUnPinChat,
		handleReorderPinnedChats
	} = useGroupChats(groupId, debouncedSearch)

	const { data: currentRoleData, loading: isLoadingGetMemberRole } =
		useGetMemberRoleQuery({
			variables: { groupId },
			fetchPolicy: 'network-only'
		})

	const currentRole = currentRoleData?.getMemberRole
	const groupPermissions = currentRole?.permissions ?? []
	const isCreator = !!currentRole?.isCreator
	const resolvedGroupName = groupData?.findGroupByGroupId?.groupName ?? groupName
	const resolvedGroupAvatarUrl =
		groupData?.findGroupByGroupId?.avatarUrl ?? null

	const handleGroupAccessLoss = useCallback(() => {
		if (handledAccessLossRef.current) return
		handledAccessLossRef.current = true
		resetToHome()
	}, [])

	useEffect(() => {
		if (!isGroupMembershipRevokedError(groupError)) return
		handleGroupAccessLoss()
	}, [groupError, handleGroupAccessLoss])

	useFocusEffect(
		useCallback(() => {
			void refetchGroup()
		}, [refetchGroup])
	)

	useGroupDeletedSubscription({
		variables: { userId },
		skip: !userId,
		onData: ({ data }) => {
			if (data.data?.groupDeleted.id !== groupId) return
			handleGroupAccessLoss()
		}
	})

	if (isLoadingFindAllChats || isLoadingGetMemberRole) {
		return <ChatsListSkeleton />
	}

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			<ChatsListHeader
				groupId={groupId}
				groupName={resolvedGroupName}
				avatarUrl={resolvedGroupAvatarUrl}
				chatCount={allChats.length}
				isSearchVisible={isSearchVisible}
				searchQuery={searchQuery}
				onSearchToggle={() => {
					if (isSearchVisible) {
						setSearchQuery('')
						setDebouncedSearch('')
					}
					setIsSearchVisible(!isSearchVisible)
				}}
				onSearchChange={setSearchQuery}
			/>

			<DraggableFlatList
				data={allChats}
				keyExtractor={item => item.id}
				showsVerticalScrollIndicator={false}
				bounces
				alwaysBounceVertical
				overScrollMode='always'
				contentContainerStyle={{
					flexGrow: 1,
					paddingTop: 4,
					paddingBottom: bottom + 104
				}}
				refreshing={isRefreshingChats}
				onRefresh={() => void handleRefreshChats()}
				onDragEnd={({ data }) => {
					const reorderedPinned = data.filter(chat => chat.isPinned)
					if (reorderedPinned.length > 1) {
						void handleReorderPinnedChats(reorderedPinned)
					}
				}}
				ListEmptyComponent={
					<View className='py-16 items-center'>
						<Text
							className='text-base'
							style={{ color: colors.textMuted }}
						>
							{t('noChats')}
						</Text>
					</View>
				}
				renderItem={({ item, drag, isActive }) => (
					<ChatDropdownTrigger
						key={item.id}
						groupId={groupId}
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

			{(groupPermissions.includes(GroupPermissionEnum.CreateChats) ||
				isCreator) && (
				<>
					<ChatsFloatingActions
						onCreatePress={() => setIsCreateOpen(true)}
					/>

					<CreateChatModal
						setAllChats={setAllChats}
						groupId={groupId}
						isOpen={isCreateOpen}
						setIsOpen={setIsCreateOpen}
					/>
				</>
			)}
		</View>
	)
}

export default ChatsList
