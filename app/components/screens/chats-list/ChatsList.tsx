import { useFocusEffect, useRoute } from '@react-navigation/native'
import { MessageSquare, Search } from 'lucide-react-native'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { RefreshControl, View } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import EmptyStateCard from '@/components/ui/EmptyStateCard'
import ProtectedScreenState from '@/components/ui/ProtectedScreenState'

import {
	getGraphQLErrorMessage,
	isGroupMembershipRevokedError,
	isUnauthorizedError
} from '@/hooks/useBlockedUsers'
import { useAuth } from '@/hooks/useAuth'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useUser } from '@/hooks/useUser'

import { resetToAuth, resetToHome } from '@/navigation/navigate'

import ChatDropdownTrigger from './ChatDropdownTrigger'
import ChatsFloatingActions from './ChatsFloatingActions'
import ChatsListHeader from './ChatsListHeader'
import ChatsListSkeleton from './ChatsListSkeleton'
import CreateChatModal from './CreateChatModal'
import { useGroupChats } from './useGroupChats'
import {
	GroupPermissionEnum,
	useFindGroupByGroupIdQuery,
	useGetMemberRoleQuery,
	useGroupDeletedSubscription
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
	const { isAuthenticated } = useAuth()
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
		loading: isLoadingGroupAccess,
		error: groupError,
		refetch: refetchGroup
	} = useFindGroupByGroupIdQuery({
		variables: { groupId },
		fetchPolicy: 'network-only'
	})

	const {
		allChats,
		disabledChatIds,
		pinnedChats,
		setAllChats,
		isInitialLoading,
		isRefreshingChats,
		handleRefreshChats,
		handleDeleteChat,
		handlePinChat,
		handleUnPinChat,
		handleReorderPinnedChats
	} = useGroupChats(groupId, debouncedSearch)

	const {
		data: currentRoleData,
		error: currentRoleError,
		loading: isLoadingGetMemberRole,
		refetch: refetchCurrentRole
	} = useGetMemberRoleQuery({
		variables: { groupId },
		fetchPolicy: 'network-only'
	})

	const currentRole = currentRoleData?.getMemberRole
	const groupPermissions = currentRole?.permissions ?? []
	const isCreator = !!currentRole?.isCreator
	const resolvedGroupName =
		groupData?.findGroupByGroupId?.groupName ?? groupName
	const resolvedGroupAvatarUrl =
		groupData?.findGroupByGroupId?.avatarUrl ?? null

	const handleGroupAccessLoss = useCallback(() => {
		if (handledAccessLossRef.current) return
		handledAccessLossRef.current = true
		resetToHome()
	}, [])

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

	const isCheckingAccess =
		isInitialLoading || isLoadingGroupAccess || isLoadingGetMemberRole
	const isAuthRequired =
		!isAuthenticated ||
		(!isLoadingGroupAccess && isUnauthorizedError(groupError)) ||
		(!isLoadingGetMemberRole && isUnauthorizedError(currentRoleError))
	const isAccessDenied =
		!isCheckingAccess && isGroupMembershipRevokedError(groupError)
	const loadError =
		!isCheckingAccess
			? (!isAccessDenied && groupError) || currentRoleError || null
			: null

	useEffect(() => {
		if (!isAuthRequired) return
		resetToAuth()
	}, [isAuthRequired])

	const handleRetry = useCallback(() => {
		void Promise.allSettled([
			handleRefreshChats(),
			refetchGroup(),
			refetchCurrentRole()
		])
	}, [handleRefreshChats, refetchCurrentRole, refetchGroup])

	if (isAuthRequired) {
		return (
			<ProtectedScreenState
				variant='auth'
				title={t('authRequiredTitle')}
				description={t('authRequiredDescription')}
				primaryActionLabel={t('goToLogin')}
				onPrimaryAction={resetToAuth}
			/>
		)
	}

	if (isCheckingAccess) {
		return <ChatsListSkeleton />
	}

	if (isAccessDenied) {
		return (
			<ProtectedScreenState
				title={t('accessDeniedTitle')}
				description={t('groupAccessDeniedDescription')}
				primaryActionLabel={t('goHome')}
				onPrimaryAction={resetToHome}
			/>
		)
	}

	if (!isInitialLoading && !isLoadingGetMemberRole && loadError) {
		return (
			<ProtectedScreenState
				variant='error'
				title={t('screenLoadErrorTitle')}
				description={
					getGraphQLErrorMessage(loadError) ||
					t('somethingWentWrong')
				}
				primaryActionLabel={t('retry')}
				onPrimaryAction={handleRetry}
				secondaryActionLabel={t('goHome')}
				onSecondaryAction={resetToHome}
			/>
		)
	}

	if (
		!isInitialLoading &&
		!isLoadingGetMemberRole &&
		!groupData?.findGroupByGroupId
	) {
		return (
			<ProtectedScreenState
				title={t('accessDeniedTitle')}
				description={t('groupAccessDeniedDescription')}
				primaryActionLabel={t('goHome')}
				onPrimaryAction={resetToHome}
			/>
		)
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
				refreshControl={
					<RefreshControl
						refreshing={isRefreshingChats}
						onRefresh={() => void handleRefreshChats()}
						tintColor={colors.accent}
						colors={[colors.accent]}
						progressBackgroundColor={colors.card}
					/>
				}
				onDragEnd={({ data }) => {
					const reorderedPinned = data.filter(chat => chat.isPinned)
					if (reorderedPinned.length > 1) {
						void handleReorderPinnedChats(reorderedPinned)
					}
				}}
				ListEmptyComponent={
					<EmptyStateCard
						icon={debouncedSearch.trim().length > 0 ? Search : MessageSquare}
						title={
							debouncedSearch.trim().length > 0
								? t('noSearchResults')
								: t('noChats')
						}
						description={
							debouncedSearch.trim().length > 0
								? t('tryDifferentQuery')
								: t('emptyChatsDescription')
						}
					/>
				}
				renderItem={({ item, drag, isActive }) => (
					<ChatDropdownTrigger
						key={item.id}
						groupId={groupId}
						chat={item}
						disabled={disabledChatIds.includes(item.id)}
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
