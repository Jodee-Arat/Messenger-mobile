import { Heart, Users } from 'lucide-react-native'
import { FC, useCallback } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'

import { useFriends } from '../../../../hooks/useFriends'
import { TabKey } from '../../../../types/tab-key.type'

import { FriendItem } from './FriendItem'
import FriendsListSkeleton from './FriendsListSkeleton'
import { RequestItem } from './RequestItem'

type FriendsReturn = ReturnType<typeof useFriends>
type Friend = FriendsReturn['friends'][0]

interface FriendsTabContentProps {
	activeTab: TabKey
	friends: FriendsReturn['friends']
	incoming: FriendsReturn['incoming']
	outgoing: FriendsReturn['outgoing']
	isSearching: boolean
	isLoadingFriends: boolean
	isLoadingIncoming: boolean
	isLoadingOutgoing: boolean
	getFriendUser: FriendsReturn['getFriendUser']
	handleRemoveFriend: FriendsReturn['handleRemoveFriend']
	handleAccept: FriendsReturn['handleAccept']
	handleDecline: FriendsReturn['handleDecline']
	handleCancel: FriendsReturn['handleCancel']
}

const FriendsTabContent: FC<FriendsTabContentProps> = ({
	activeTab,
	friends,
	incoming,
	outgoing,
	isSearching,
	isLoadingFriends,
	isLoadingIncoming,
	isLoadingOutgoing,
	getFriendUser,
	handleRemoveFriend,
	handleAccept,
	handleDecline,
	handleCancel
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { userId } = useUser()
	const navigation = useTypedNavigation()

	const handleFriendPress = useCallback(
		(friendshipId: string) => {
			const f = friends.find(fr => fr.id === friendshipId)
			if (!f) return
			const other = getFriendUser(f)
			if (!other) return
			navigation.navigate('FriendProfile', {
				friendshipId: f.id,
				username: other.username,
				avatarUrl: other.avatarUrl,
				bio: other.bio,
				friendUserId: other.id,
				friendSince: f.createdAt
			})
		},
		[friends, getFriendUser, navigation]
	)

	const isTabLoading =
		activeTab === 'all'
			? isLoadingFriends
			: isLoadingIncoming || isLoadingOutgoing

	if (isTabLoading) {
		return <FriendsListSkeleton />
	}

	if (activeTab === 'all') {
		if (friends.length === 0) {
			return (
				<View className='py-16 items-center px-8'>
					<Users size={48} color={colors.borderLight} />
					<Text
						className='text-base font-semibold mt-4 text-center'
						style={{ color: colors.textMuted }}
					>
						{isSearching ? t('noSearchResults') : t('noFriends')}
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
			)
		}
		return (
			<>
				{friends.map(f => {
					const other = getFriendUser(f)
					if (!other) return null
					return (
						<FriendItem
							key={f.id}
							id={f.id}
							username={other.username}
							avatarUrl={other.avatarUrl}
							onPress={handleFriendPress}
							onRemove={handleRemoveFriend}
						/>
					)
				})}
			</>
		)
	}

	if (activeTab === 'pending') {
		if (incoming.length === 0 && outgoing.length === 0) {
			return (
				<View className='py-16 items-center px-8'>
					<Heart size={48} color={colors.borderLight} />
					<Text
						className='text-base font-semibold mt-4 text-center'
						style={{ color: colors.textMuted }}
					>
						{isSearching
							? t('noSearchResults')
							: t('noPendingRequests')}
					</Text>
					{isSearching && (
						<Text
							className='text-xs mt-2 text-center'
							style={{ color: colors.textMuted }}
						>
							{t('tryDifferentQuery')}
						</Text>
					)}
				</View>
			)
		}
		return (
			<>
				{incoming.length > 0 && (
					<View className='px-5 pt-3 pb-1'>
						<Text
							className='text-xs font-bold uppercase tracking-wider'
							style={{ color: colors.textMuted }}
						>
							{t('incoming')} — {incoming.length}
						</Text>
					</View>
				)}
				{incoming.map(f => {
					const sender = f.user
					if (!sender) return null
					return (
						<RequestItem
							key={f.id}
							id={f.id}
							type='incoming'
							username={sender.username}
							avatarUrl={sender.avatarUrl}
							onAccept={handleAccept}
							onDecline={handleDecline}
						/>
					)
				})}

				{outgoing.length > 0 && (
					<View className='px-5 pt-3 pb-1'>
						<Text
							className='text-xs font-bold uppercase tracking-wider'
							style={{ color: colors.textMuted }}
						>
							{t('outgoing')} — {outgoing.length}
						</Text>
					</View>
				)}
				{outgoing.map(f => {
					const target = f.friend
					if (!target) return null
					return (
						<RequestItem
							key={f.id}
							id={f.id}
							type='outgoing'
							username={target.username}
							avatarUrl={target.avatarUrl}
							onCancel={handleCancel}
						/>
					)
				})}
			</>
		)
	}

	// return (
	// 	<>
	// 		{friends.map(f => {
	// 			const other = getFriendUser(f)
	// 			if (!other) return null
	// 			return (
	// 				<FriendItem
	// 					key={f.id}
	// 					id={f.id}
	// 					username={other.username}
	// 					avatarUrl={other.avatarUrl}
	// 					onRemove={handleRemoveFriend}
	// 				/>
	// 			)
	// 		})}
	// 	</>
	// )
}

export default FriendsTabContent
