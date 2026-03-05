import { MessageCircle, UserPlus } from 'lucide-react-native'
import { FC, useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { useFriends } from '../../../hooks/useFriends'
import { TabKey } from '../../../types/tab-key.type'

import Header from './Header'
import HomeSkeleton from './HomeSkeleton'
import QuickActions from './QuickActions'
import AddFriendModal from './friend/AddFriendModal'
import FriendsTabContent from './friend/FriendsTabContent'
import FriendsTabs from './friend/FriendsTabs'
import GroupsSidebar from './groups/GroupsSidebar'

const Home: FC = () => {
	const navigation = useTypedNavigation()
	const { isLoadingProfile, user } = useCurrentUser()
	const [sidebarVisible, setSidebarVisible] = useState(false)
	const [activeTab, setActiveTab] = useState<TabKey>('all')
	const { colors } = useTheme()
	const { t } = useTranslation()

	const actions = [
		{
			icon: <UserPlus size={20} color={colors.accent} />,
			label: t('addFriend'),
			onPress: () => setAddFriendVisible(true)
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
		isSending,
		addFriendVisible,
		setAddFriendVisible,
		friendUsername,
		setFriendUsername,
		handleSendRequest,
		handleAccept,
		handleDecline,
		handleCancel,
		handleRemoveFriend,
		getFriendUser
	} = useFriends()

	if (isLoadingProfile || !user) {
		return <HomeSkeleton />
	}

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			<Header onMenuPress={() => setSidebarVisible(true)} />

			<QuickActions actions={actions} />

			<FriendsTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{/* Friends / Pending content */}
			{activeTab !== 'all' || friends.length > 0 || isLoadingFriends ? (
				<FlatList
					data={[1]}
					keyExtractor={() => 'friends-tab'}
					contentContainerStyle={{ paddingBottom: 20 }}
					showsVerticalScrollIndicator={false}
					renderItem={() => (
						<FriendsTabContent
							activeTab={activeTab}
							friends={friends}
							incoming={incoming}
							outgoing={outgoing}
							isLoadingFriends={isLoadingFriends}
							isLoadingIncoming={isLoadingIncoming}
							isLoadingOutgoing={isLoadingOutgoing}
							getFriendUser={getFriendUser}
							handleRemoveFriend={handleRemoveFriend}
							handleAccept={handleAccept}
							handleDecline={handleDecline}
							handleCancel={handleCancel}
						/>
					)}
				/>
			) : (
				<View className='py-16 items-center px-8'>
					<UserPlus size={48} color={colors.borderLight} />
					<Text
						className='text-base font-semibold mt-4 text-center'
						style={{ color: colors.textMuted }}
					>
						{t('noFriends')}
					</Text>
					<Text
						className='text-xs mt-2 text-center'
						style={{ color: colors.textMuted }}
					>
						{t('addFriendsHint')}
					</Text>
				</View>
			)}

			<AddFriendModal
				visible={addFriendVisible}
				username={friendUsername}
				isSending={isSending}
				onChangeUsername={setFriendUsername}
				onSend={handleSendRequest}
				onClose={() => setAddFriendVisible(false)}
			/>

			<GroupsSidebar
				visible={sidebarVisible}
				onClose={() => setSidebarVisible(false)}
			/>
		</View>
	)
}

export default Home
