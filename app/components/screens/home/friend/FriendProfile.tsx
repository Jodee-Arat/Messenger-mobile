import { useRoute } from '@react-navigation/native'
import * as Clipboard from 'expo-clipboard'
import {
	ArrowLeft,
	Calendar,
	Copy,
	Lock,
	MessageCircle,
	Shield,
	UserMinus,
	UserPlus
} from 'lucide-react-native'
import { FC, useCallback, useMemo, useState } from 'react'
import {
	Alert,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import EntityAvatar from '@/components/ui/EntityAvatar'

import {
	getGraphQLErrorMessage,
	isDirectContactBlockedError,
	useBlockedUsers
} from '@/hooks/useBlockedUsers'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { markDirectChatStarted } from '@/utils/direct-chat-visibility'

import { TypeRootStackParamList } from '@/navigation/navigation.types'

import FriendProfileSkeleton from './FriendProfileSkeleton'
import {
	useBlockUserMutation,
	useFindOrCreateDirectChatMutation,
	useGetFriendsQuery,
	useGetOutgoingFriendRequestsQuery,
	useRemoveFriendMutation,
	useSendFriendRequestByUsernameMutation,
	useUnblockUserMutation
} from '@/graphql/generated/output'

type RouteParams = TypeRootStackParamList['FriendProfile']

const FriendProfile: FC = () => {
	const navigation = useTypedNavigation()
	const route = useRoute()
	const params = route.params as RouteParams
	const {
		isLoadingProfile,
		user,
		refetch: refetchCurrentUser
	} = useCurrentUser()

	const {
		username,
		avatarUrl,
		friendshipId: initialFriendshipId,
		friendSince: initialFriendSince,
		friendUserId
	} = params
	const bio = params.bio?.trim() ?? ''

	const { colors } = useTheme()
	const { t } = useTranslation()
	const { top } = useSafeAreaInsets()
	const [isRefreshing, setIsRefreshing] = useState(false)
	const { getBlockedFriendship, refetch: refetchBlockedUsers } =
		useBlockedUsers()
	const { data: friendsData, refetch: refetchFriends } = useGetFriendsQuery({
		skip: !user,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true
	})
	const { data: outgoingData, refetch: refetchOutgoing } =
		useGetOutgoingFriendRequestsQuery({
			skip: !user,
			fetchPolicy: 'network-only',
			notifyOnNetworkStatusChange: true
		})

	const [removeFriend] = useRemoveFriendMutation({
		refetchQueries: ['GetFriends']
	})
	const [blockUser, { loading: isBlockingUser }] = useBlockUserMutation()
	const [unblockUser, { loading: isUnblockingUser }] =
		useUnblockUserMutation()
	const [sendFriendRequest, { loading: isSendingFriendRequest }] =
		useSendFriendRequestByUsernameMutation()
	const [findOrCreateDirectChat, { loading: isCreatingChat }] =
		useFindOrCreateDirectChatMutation()

	const friendship = useMemo(() => {
		if (!user || !friendsData?.getFriends) return null

		return (
			friendsData.getFriends.find(friendshipItem => {
				const otherUser =
					friendshipItem.userId === user.id
						? friendshipItem.friend
						: friendshipItem.user

				return otherUser?.id === friendUserId
			}) ?? null
		)
	}, [friendUserId, friendsData, user])

	const resolvedFriendUser = useMemo(() => {
		if (!user || !friendship) return null
		return friendship.userId === user.id
			? friendship.friend
			: friendship.user
	}, [user, friendship])

	const displayUsername = resolvedFriendUser?.username ?? username
	const displayAvatarUrl = resolvedFriendUser?.avatarUrl ?? avatarUrl ?? null
	const displayBio = (resolvedFriendUser?.bio ?? bio ?? '').trim()

	const resolvedFriendshipId = friendship?.id ?? initialFriendshipId ?? null
	const resolvedFriendSince =
		friendship?.createdAt ?? initialFriendSince ?? null
	const hasOutgoingRequest = useMemo(
		() =>
			(outgoingData?.getOutgoingFriendRequests ?? []).some(
				request => request.friend?.id === friendUserId
			),
		[friendUserId, outgoingData]
	)

	const blockedFriendship = getBlockedFriendship(friendUserId)
	const isBlockedByMe = !!blockedFriendship
	const isMutatingBlockState = isBlockingUser || isUnblockingUser

	const formattedDate = useMemo(() => {
		if (!resolvedFriendSince) return null

		const d = new Date(resolvedFriendSince)
		return d.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	}, [resolvedFriendSince])

	const friendDuration = useMemo(() => {
		if (!resolvedFriendSince) return null

		const now = new Date()
		const since = new Date(resolvedFriendSince)
		const diffMs = now.getTime() - since.getTime()
		const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
		if (days < 1) return t('friendDurationToday')
		if (days === 1) return `1 ${t('friendDurationDay')}`
		if (days < 30) return `${days} ${t('friendDurationDays')}`
		const months = Math.floor(days / 30)
		if (months === 1) return `1 ${t('friendDurationMonth')}`
		if (months < 12) return `${months} ${t('friendDurationMonths')}`
		const years = Math.floor(months / 12)
		if (years === 1) return `1 ${t('friendDurationYear')}`
		return `${years} ${t('friendDurationYears')}`
	}, [resolvedFriendSince, t])

	const handleCopyUsername = useCallback(async () => {
		await Clipboard.setStringAsync(`@${displayUsername}`)
		Alert.alert(t('copied'), `@${displayUsername}`)
	}, [displayUsername, t])

	const handleRefresh = useCallback(async () => {
		try {
			setIsRefreshing(true)
			await Promise.allSettled([
				refetchCurrentUser(),
				refetchBlockedUsers(),
				refetchFriends(),
				refetchOutgoing()
			])
		} finally {
			setIsRefreshing(false)
		}
	}, [
		refetchBlockedUsers,
		refetchCurrentUser,
		refetchFriends,
		refetchOutgoing
	])

	const handleSendMessage = useCallback(async () => {
		if (isBlockedByMe) {
			Alert.alert(
				t('blockedProfileTitle'),
				t('blockedProfileDescription')
			)
			return
		}

		try {
			const { data } = await findOrCreateDirectChat({
				variables: { friendUserId }
			})
			if (data?.findOrCreateDirectChat) {
				const chat = data.findOrCreateDirectChat
				if (user?.id) {
					await markDirectChatStarted(user.id, chat.id)
				}
				navigation.navigate('Chat', {
					chatId: chat.id,
					chatName: chat.chatName || displayUsername,
					isSecret: chat.isSecret,
					groupId: chat.groupId || undefined
				})
			}
		} catch (e: any) {
			if (isDirectContactBlockedError(e)) {
				Alert.alert(
					t('directChatUnavailable'),
					t('directChatBlockedDescription')
				)
				return
			}
			Alert.alert(t('error'), getGraphQLErrorMessage(e))
		}
	}, [
		findOrCreateDirectChat,
		friendUserId,
		isBlockedByMe,
		navigation,
		t,
		displayUsername
	])

	const handleSendSecretMessage = useCallback(async () => {
		if (isBlockedByMe) {
			Alert.alert(
				t('blockedProfileTitle'),
				t('blockedProfileDescription')
			)
			return
		}

		try {
			const { data } = await findOrCreateDirectChat({
				variables: { friendUserId, isSecret: true }
			})
			if (data?.findOrCreateDirectChat) {
				const chat = data.findOrCreateDirectChat
				if (user?.id) {
					await markDirectChatStarted(user.id, chat.id)
				}
				navigation.navigate('Chat', {
					chatId: chat.id,
					chatName: chat.chatName || displayUsername,
					isSecret: true,
					groupId: chat.groupId || undefined
				})
			}
		} catch (e: any) {
			if (isDirectContactBlockedError(e)) {
				Alert.alert(
					t('directChatUnavailable'),
					t('directChatBlockedDescription')
				)
				return
			}
			Alert.alert(t('error'), getGraphQLErrorMessage(e))
		}
	}, [
		findOrCreateDirectChat,
		friendUserId,
		isBlockedByMe,
		navigation,
		t,
		displayUsername
	])

	const handleRemove = useCallback(() => {
		if (!resolvedFriendshipId) return

		Alert.alert(t('removeFriend'), t('removeFriendConfirm'), [
			{ text: t('cancel'), style: 'cancel' },
			{
				text: t('remove'),
				style: 'destructive',
				onPress: async () => {
					try {
						await removeFriend({
							variables: { friendshipId: resolvedFriendshipId }
						})
						navigation.goBack()
					} catch (e: any) {
						Alert.alert(t('error'), getGraphQLErrorMessage(e))
					}
				}
			}
		])
	}, [navigation, removeFriend, resolvedFriendshipId, t])

	const handleAddFriend = useCallback(async () => {
		try {
			await sendFriendRequest({
				variables: { username: displayUsername },
				refetchQueries: ['GetOutgoingFriendRequests', 'GetFriends'],
				awaitRefetchQueries: true
			})
			Alert.alert(t('addFriend'), t('friendRequestSent'))
		} catch (e: any) {
			Alert.alert(t('error'), getGraphQLErrorMessage(e))
		}
	}, [displayUsername, sendFriendRequest, t])

	const handleBlock = useCallback(() => {
		Alert.alert(t('blockUser'), t('blockUserConfirm'), [
			{ text: t('cancel'), style: 'cancel' },
			{
				text: t('block'),
				style: 'destructive',
				onPress: async () => {
					try {
						await blockUser({
							variables: { targetUserId: friendUserId },
							refetchQueries: [
								'GetFriends',
								'GetBlockedUsers',
								'FindAllChatsByUser'
							],
							awaitRefetchQueries: true
						})
						navigation.goBack()
					} catch (e: any) {
						Alert.alert(t('error'), getGraphQLErrorMessage(e))
					}
				}
			}
		])
	}, [friendUserId, blockUser, navigation, t])

	const handleUnblock = useCallback(() => {
		if (!blockedFriendship) return

		Alert.alert(t('unblockUser'), t('unblockUserConfirm'), [
			{ text: t('cancel'), style: 'cancel' },
			{
				text: t('unblockUser'),
				style: 'destructive',
				onPress: async () => {
					try {
						await unblockUser({
							variables: { friendshipId: blockedFriendship.id },
							refetchQueries: [
								'GetFriends',
								'GetBlockedUsers',
								'FindAllChatsByUser'
							],
							awaitRefetchQueries: true
						})
					} catch (e: any) {
						Alert.alert(t('error'), getGraphQLErrorMessage(e))
					}
				}
			}
		])
	}, [blockedFriendship, t, unblockUser])

	if (isLoadingProfile || !user) {
		return <FriendProfileSkeleton />
	}

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			{/* Header with back button */}
			<View
				className='flex-row items-center px-4 pb-3'
				style={{
					paddingTop: top + 12,
					borderBottomWidth: 0.5,
					borderBottomColor: colors.border
				}}
			>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className='p-2 rounded-full mr-3'
					style={{
						backgroundColor: colors.backgroundSecondary
					}}
				>
					<ArrowLeft size={20} color={colors.text} />
				</TouchableOpacity>
				<Text
					className='text-lg font-bold flex-1'
					style={{ color: colors.text }}
				>
					{resolvedFriendshipId ? t('friendProfile') : t('profile')}
				</Text>
			</View>

			<ScrollView
				className='flex-1'
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
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
				{/* Avatar & Name Hero */}
				<View className='items-center pt-8 pb-6'>
					<View
						style={{
							padding: 4,
							borderRadius: 999,
							borderWidth: 3,
							borderColor: colors.accent
						}}
					>
						<EntityAvatar
							name={displayUsername}
							avatarUrl={displayAvatarUrl}
							size='xl'
						/>
					</View>
					<Text
						className='text-2xl font-bold mt-4'
						style={{ color: colors.text }}
					>
						{displayUsername}
					</Text>
					<TouchableOpacity
						onPress={handleCopyUsername}
						className='flex-row items-center mt-1'
						activeOpacity={0.6}
					>
						<Text
							className='text-sm mr-1'
							style={{ color: colors.textMuted }}
						>
							@{displayUsername}
						</Text>
						<Copy size={12} color={colors.textMuted} />
					</TouchableOpacity>
				</View>

				{!!displayBio && (
					<View className='mx-5 mb-5'>
						<View
							className='rounded-2xl p-4'
							style={{
								backgroundColor: colors.backgroundSecondary,
								borderWidth: 1,
								borderColor: colors.border
							}}
						>
							<Text
								className='text-xs uppercase tracking-wider font-semibold mb-2'
								style={{ color: colors.textMuted }}
							>
								{t('bio')}
							</Text>
							<Text
								className='text-sm leading-5'
								style={{ color: colors.text }}
							>
								{displayBio}
							</Text>
						</View>
					</View>
				)}

				{/* Friend since badge */}
				{formattedDate && friendDuration && (
					<View className='mx-5 mb-5'>
						<View
							className='rounded-2xl p-4 flex-row items-center'
							style={{
								backgroundColor: colors.backgroundSecondary,
								borderWidth: 1,
								borderColor: colors.border
							}}
						>
							<View
								className='w-10 h-10 rounded-full items-center justify-center mr-3'
								style={{
									backgroundColor: colors.accent + '20'
								}}
							>
								<Calendar size={20} color={colors.accent} />
							</View>
							<View className='flex-1'>
								<Text
									className='text-xs uppercase tracking-wider font-semibold'
									style={{ color: colors.textMuted }}
								>
									{t('friendSince')}
								</Text>
								<Text
									className='text-sm font-semibold mt-0.5'
									style={{ color: colors.text }}
								>
									{formattedDate}
								</Text>
							</View>
							<View
								className='px-3 py-1.5 rounded-full'
								style={{
									backgroundColor: colors.success + '18'
								}}
							>
								<Text
									className='text-xs font-bold'
									style={{ color: colors.success }}
								>
									{friendDuration}
								</Text>
							</View>
						</View>
					</View>
				)}

				{/* Action buttons */}
				<View className='mx-5'>
					<Text
						className='text-xs font-semibold uppercase tracking-wider mb-3 ml-1'
						style={{ color: colors.textMuted }}
					>
						{t('actions')}
					</Text>

					{isBlockedByMe && (
						<View
							className='rounded-2xl p-4 mb-3'
							style={{
								backgroundColor: colors.backgroundSecondary,
								borderWidth: 1,
								borderColor: colors.border
							}}
						>
							<View className='flex-row items-center'>
								<View
									className='w-10 h-10 rounded-full items-center justify-center mr-3'
									style={{
										backgroundColor:
											colors.destructive + '18'
									}}
								>
									<Shield
										size={20}
										color={colors.destructive}
									/>
								</View>
								<View className='flex-1'>
									<Text
										className='text-sm font-semibold'
										style={{ color: colors.text }}
									>
										{t('blockedProfileTitle')}
									</Text>
									<Text
										className='text-xs mt-1'
										style={{ color: colors.textMuted }}
									>
										{t('blockedProfileDescription')}
									</Text>
								</View>
							</View>
						</View>
					)}

					{!isBlockedByMe && !resolvedFriendshipId && (
						<TouchableOpacity
							activeOpacity={0.7}
							onPress={handleAddFriend}
							disabled={
								hasOutgoingRequest || isSendingFriendRequest
							}
							className='flex-row items-center px-4 py-4 rounded-2xl mb-2'
							style={{
								backgroundColor: colors.backgroundSecondary,
								borderWidth: 1,
								borderColor: colors.border,
								opacity:
									hasOutgoingRequest || isSendingFriendRequest
										? 0.7
										: 1
							}}
						>
							<View
								className='w-9 h-9 rounded-full items-center justify-center mr-3'
								style={{
									backgroundColor: colors.accent + '20'
								}}
							>
								<UserPlus size={18} color={colors.accent} />
							</View>
							<View className='flex-1'>
								<Text
									className='text-sm font-semibold'
									style={{ color: colors.text }}
								>
									{hasOutgoingRequest
										? t('pending')
										: t('addFriend')}
								</Text>
								<Text
									className='text-xs mt-0.5'
									style={{ color: colors.textMuted }}
								>
									{hasOutgoingRequest
										? t('outgoingRequest')
										: `@${displayUsername}`}
								</Text>
							</View>
						</TouchableOpacity>
					)}

					{!isBlockedByMe && (
						<>
							{/* Send message */}
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={handleSendMessage}
								disabled={isCreatingChat}
								className='flex-row items-center px-4 py-4 rounded-2xl mb-2'
								style={{
									backgroundColor: colors.accent,
									opacity: isCreatingChat ? 0.7 : 1
								}}
							>
								<View
									className='w-9 h-9 rounded-full items-center justify-center mr-3'
									style={{
										backgroundColor: 'rgba(255,255,255,0.2)'
									}}
								>
									<MessageCircle size={18} color='#fff' />
								</View>
								<View className='flex-1'>
									<Text
										className='text-sm font-bold'
										style={{ color: '#fff' }}
									>
										{t('sendMessage')}
									</Text>
									<Text
										className='text-xs mt-0.5'
										style={{
											color: 'rgba(255,255,255,0.7)'
										}}
									>
										{t('sendMessageHint')}
									</Text>
								</View>
							</TouchableOpacity>

							{/* Secret chat */}
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={handleSendSecretMessage}
								disabled={isCreatingChat}
								className='flex-row items-center px-4 py-4 rounded-2xl mb-2'
								style={{
									backgroundColor: '#1B5E20',
									opacity: isCreatingChat ? 0.7 : 1
								}}
							>
								<View
									className='w-9 h-9 rounded-full items-center justify-center mr-3'
									style={{
										backgroundColor: 'rgba(255,255,255,0.2)'
									}}
								>
									<Lock size={18} color='#fff' />
								</View>
								<View className='flex-1'>
									<Text
										className='text-sm font-bold'
										style={{ color: '#fff' }}
									>
										{t('secretChat')}
									</Text>
									<Text
										className='text-xs mt-0.5'
										style={{
											color: 'rgba(255,255,255,0.7)'
										}}
									>
										{t('secretChatHint')}
									</Text>
								</View>
							</TouchableOpacity>
						</>
					)}

					{/* Copy username */}
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={handleCopyUsername}
						className='flex-row items-center px-4 py-4 rounded-2xl mb-2'
						style={{
							backgroundColor: colors.backgroundSecondary,
							borderWidth: 1,
							borderColor: colors.border
						}}
					>
						<View
							className='w-9 h-9 rounded-full items-center justify-center mr-3'
							style={{
								backgroundColor: colors.accent + '20'
							}}
						>
							<Copy size={18} color={colors.accent} />
						</View>
						<View className='flex-1'>
							<Text
								className='text-sm font-semibold'
								style={{ color: colors.text }}
							>
								{t('copyUsername')}
							</Text>
							<Text
								className='text-xs mt-0.5'
								style={{ color: colors.textMuted }}
							>
								@{displayUsername}
							</Text>
						</View>
					</TouchableOpacity>

					{!isBlockedByMe && resolvedFriendshipId && (
						<>
							{/* Remove friend */}
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={handleRemove}
								className='flex-row items-center px-4 py-4 rounded-2xl mb-2'
								style={{
									backgroundColor: colors.backgroundSecondary,
									borderWidth: 1,
									borderColor: colors.border
								}}
							>
								<View
									className='w-9 h-9 rounded-full items-center justify-center mr-3'
									style={{
										backgroundColor:
											colors.destructive + '18'
									}}
								>
									<UserMinus
										size={18}
										color={colors.destructive}
									/>
								</View>
								<View className='flex-1'>
									<Text
										className='text-sm font-semibold'
										style={{ color: colors.destructive }}
									>
										{t('removeFriend')}
									</Text>
									<Text
										className='text-xs mt-0.5'
										style={{ color: colors.textMuted }}
									>
										{t('removeFriendHint')}
									</Text>
								</View>
							</TouchableOpacity>

							{/* Block user */}
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={handleBlock}
								disabled={isMutatingBlockState}
								className='flex-row items-center px-4 py-4 rounded-2xl'
								style={{
									backgroundColor: colors.backgroundSecondary,
									borderWidth: 1,
									borderColor: colors.border,
									opacity: isMutatingBlockState ? 0.7 : 1
								}}
							>
								<View
									className='w-9 h-9 rounded-full items-center justify-center mr-3'
									style={{
										backgroundColor:
											colors.destructive + '18'
									}}
								>
									<Shield
										size={18}
										color={colors.destructive}
									/>
								</View>
								<View className='flex-1'>
									<Text
										className='text-sm font-semibold'
										style={{ color: colors.destructive }}
									>
										{t('blockUser')}
									</Text>
									<Text
										className='text-xs mt-0.5'
										style={{ color: colors.textMuted }}
									>
										{t('blockUserHint')}
									</Text>
								</View>
							</TouchableOpacity>
						</>
					)}

					{isBlockedByMe && (
						<TouchableOpacity
							activeOpacity={0.7}
							onPress={handleUnblock}
							disabled={isMutatingBlockState}
							className='flex-row items-center px-4 py-4 rounded-2xl'
							style={{
								backgroundColor: colors.backgroundSecondary,
								borderWidth: 1,
								borderColor: colors.border,
								opacity: isMutatingBlockState ? 0.7 : 1
							}}
						>
							<View
								className='w-9 h-9 rounded-full items-center justify-center mr-3'
								style={{
									backgroundColor: colors.accent + '20'
								}}
							>
								<Shield size={18} color={colors.accent} />
							</View>
							<View className='flex-1'>
								<Text
									className='text-sm font-semibold'
									style={{ color: colors.accent }}
								>
									{t('unblockUser')}
								</Text>
								<Text
									className='text-xs mt-0.5'
									style={{ color: colors.textMuted }}
								>
									{t('unblockUserHint')}
								</Text>
							</View>
						</TouchableOpacity>
					)}
				</View>
			</ScrollView>
		</View>
	)
}

export default FriendProfile
