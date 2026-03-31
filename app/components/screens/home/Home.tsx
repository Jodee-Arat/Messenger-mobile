import { MessageCircle, UserPlus } from 'lucide-react-native'
import { FC, useMemo, useState } from 'react'
import {
	Keyboard,
	Pressable,
	RefreshControl,
	ScrollView,
	View
} from 'react-native'

import { getGraphQLErrorMessage } from '@/hooks/useBlockedUsers'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { useFriends } from '../../../hooks/useFriends'
import { TabKey } from '../../../types/tab-key.type'

import Header from './Header'
import HomeSkeleton from './HomeSkeleton'
import QuickActions from './QuickActions'
import FindPeopleModal from './friend/AddFriendModal'
import FriendsTabContent from './friend/FriendsTabContent'
import FriendsTabs from './friend/FriendsTabs'
import GroupsSidebar from './groups/GroupsSidebar'
import { useFindAllUsersQuery } from '@/graphql/generated/output'

const Home: FC = () => {
	const navigation = useTypedNavigation()
	const { isLoadingProfile, user } = useCurrentUser()
	const [sidebarVisible, setSidebarVisible] = useState(false)
	const [isFindPeopleVisible, setIsFindPeopleVisible] = useState(false)
	const [findPeopleQuery, setFindPeopleQuery] = useState('')
	const [activeTab, setActiveTab] = useState<TabKey>('all')
	const [isSearchVisible, setIsSearchVisible] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const { colors } = useTheme()
	const { t } = useTranslation()
	const trimmedFindPeopleQuery = findPeopleQuery.trim()
	const debouncedFindPeopleQuery = useDebouncedValue(
		trimmedFindPeopleQuery,
		1500
	)
	const findPeopleFilters = useMemo(
		() =>
			debouncedFindPeopleQuery
				? { searchTerm: debouncedFindPeopleQuery, take: 10 }
				: { take: 10 },
		[debouncedFindPeopleQuery]
	)

	const actions = [
		{
			icon: <UserPlus size={20} color={colors.accent} />,
			label: t('findPeople'),
			onPress: () => setIsFindPeopleVisible(true)
		},
		{
			icon: <MessageCircle size={20} color={colors.accent} />,
			label: t('newMessage'),
			onPress: () => navigation.navigate('DirectMessages')
		}
	]

	const {
		friends,
		incoming,
		outgoing,
		isLoadingFriends,
		isLoadingIncoming,
		isLoadingOutgoing,
		isRefreshing,
		handleAccept,
		handleDecline,
		handleCancel,
		handleRemoveFriend,
		getFriendUser,
		handleRefresh
	} = useFriends()

	const {
		data: usersData,
		previousData: previousUsersData,
		loading: isLoadingUsers,
		error: usersError
	} = useFindAllUsersQuery({
		variables: {
			filters: findPeopleFilters
		},
		skip: !isFindPeopleVisible,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true
	})

	const discoverableUsers =
		usersData?.findAllUsers ?? previousUsersData?.findAllUsers ?? []

	const normalizedSearchQuery = searchQuery.trim().toLowerCase()
	const isSearching = normalizedSearchQuery.length > 0

	const matchesUsername = (value?: string | null) =>
		(value ?? '').toLowerCase().includes(normalizedSearchQuery)

	const filteredFriends = isSearching
		? friends.filter(friend =>
				matchesUsername(getFriendUser(friend)?.username)
			)
		: friends

	const filteredIncoming = isSearching
		? incoming.filter(friend => matchesUsername(friend.user?.username))
		: incoming

	const filteredOutgoing = isSearching
		? outgoing.filter(friend => matchesUsername(friend.friend?.username))
		: outgoing

	if (isLoadingProfile || !user) {
		return <HomeSkeleton />
	}

	const handleSelectUser = (
		selectedUser: (typeof discoverableUsers)[number]
	) => {
		const friendship = friends.find(friendshipItem => {
			const otherUser = getFriendUser(friendshipItem)
			return otherUser?.id === selectedUser.id
		})

		setIsFindPeopleVisible(false)
		setFindPeopleQuery('')

		navigation.navigate('FriendProfile', {
			friendUserId: selectedUser.id,
			username: selectedUser.username,
			avatarUrl: selectedUser.avatarUrl,
			bio: selectedUser.bio,
			friendshipId: friendship?.id,
			friendSince: friendship?.createdAt
		})
	}

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			<Header
				onMenuPress={() => setSidebarVisible(true)}
				isSearchVisible={isSearchVisible}
				searchQuery={searchQuery}
				onSearchPress={() => setIsSearchVisible(true)}
				onSearchChange={setSearchQuery}
				onSearchClose={() => {
					setSearchQuery('')
					setIsSearchVisible(false)
				}}
			/>

			<Pressable
				style={{ flex: 1 }}
				onPress={() => {
					if (isSearchVisible) {
						setSearchQuery('')
						setIsSearchVisible(false)
						Keyboard.dismiss()
					}
				}}
			>
				<QuickActions actions={actions} />

				<FriendsTabs activeTab={activeTab} onTabChange={setActiveTab} />

				<ScrollView
					className='flex-1'
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 20 }}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={handleRefresh}
							tintColor={colors.accent}
							colors={[colors.accent]}
							progressBackgroundColor={colors.card}
						/>
					}
				>
					<FriendsTabContent
						activeTab={activeTab}
						friends={filteredFriends}
						incoming={filteredIncoming}
						outgoing={filteredOutgoing}
						isLoadingFriends={isLoadingFriends}
						isLoadingIncoming={isLoadingIncoming}
						isLoadingOutgoing={isLoadingOutgoing}
						getFriendUser={getFriendUser}
						handleRemoveFriend={handleRemoveFriend}
						handleAccept={handleAccept}
						handleDecline={handleDecline}
						handleCancel={handleCancel}
						isSearching={isSearching}
					/>
				</ScrollView>
			</Pressable>

			<FindPeopleModal
				visible={isFindPeopleVisible}
				searchQuery={findPeopleQuery}
				users={discoverableUsers}
				isLoading={isLoadingUsers}
				errorMessage={getGraphQLErrorMessage(usersError)}
				onChangeSearchQuery={setFindPeopleQuery}
				onSelectUser={handleSelectUser}
				onClose={() => {
					setIsFindPeopleVisible(false)
					setFindPeopleQuery('')
				}}
			/>

			<GroupsSidebar
				visible={sidebarVisible}
				onClose={() => setSidebarVisible(false)}
			/>
		</View>
	)
}

export default Home
