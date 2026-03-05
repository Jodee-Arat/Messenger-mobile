import { useRoute } from '@react-navigation/native'
import {
	ArrowLeft,
	Calendar,
	Clock,
	Copy,
	Lock,
	MessageCircle,
	Shield,
	UserMinus
} from 'lucide-react-native'
import { FC, useCallback, useMemo } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { TypeRootStackParamList } from '@/navigation/navigation.types'

import FriendProfileSkeleton from './FriendProfileSkeleton'
import {
	useBlockUserMutation,
	useFindOrCreateDirectChatMutation,
	useRemoveFriendMutation
} from '@/graphql/generated/output'

type RouteParams = TypeRootStackParamList['FriendProfile']

const FriendProfile: FC = () => {
	const navigation = useTypedNavigation()
	const route = useRoute()
	const params = route.params as RouteParams
	const { isLoadingProfile, user } = useCurrentUser()

	const { username, avatarUrl, friendshipId, friendSince, friendUserId } =
		params

	const { colors } = useTheme()
	const { t } = useTranslation()

	const [removeFriend] = useRemoveFriendMutation({
		refetchQueries: ['GetFriends']
	})
	const [blockUser] = useBlockUserMutation()
	const [findOrCreateDirectChat, { loading: isCreatingChat }] =
		useFindOrCreateDirectChatMutation()

	const formattedDate = useMemo(() => {
		const d = new Date(friendSince)
		return d.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	}, [friendSince])

	const friendDuration = useMemo(() => {
		const now = new Date()
		const since = new Date(friendSince)
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
	}, [friendSince, t])

	const handleCopyUsername = useCallback(() => {
		Alert.alert(t('copied'), `@${username}`)
	}, [username, t])

	const handleSendMessage = useCallback(async () => {
		try {
			const { data } = await findOrCreateDirectChat({
				variables: { friendUserId }
			})
			if (data?.findOrCreateDirectChat) {
				const chat = data.findOrCreateDirectChat
				navigation.navigate('Chat', {
					chatId: chat.id,
					chatName: chat.chatName || username,
					isSecret: chat.isSecret,
					groupId: chat.groupId || undefined
				})
			}
		} catch (e: any) {
			Alert.alert(t('error'), e.message)
		}
	}, [findOrCreateDirectChat, friendUserId, username, navigation, t])

	const handleSendSecretMessage = useCallback(async () => {
		try {
			const { data } = await findOrCreateDirectChat({
				variables: { friendUserId, isSecret: true }
			})
			if (data?.findOrCreateDirectChat) {
				const chat = data.findOrCreateDirectChat
				navigation.navigate('Chat', {
					chatId: chat.id,
					chatName: chat.chatName || username,
					isSecret: true,
					groupId: chat.groupId || undefined
				})
			}
		} catch (e: any) {
			Alert.alert(t('error'), e.message)
		}
	}, [findOrCreateDirectChat, friendUserId, username, navigation, t])

	const handleRemove = useCallback(() => {
		Alert.alert(t('removeFriend'), t('removeFriendConfirm'), [
			{ text: t('cancel'), style: 'cancel' },
			{
				text: t('remove'),
				style: 'destructive',
				onPress: async () => {
					try {
						await removeFriend({
							variables: { friendshipId }
						})
						navigation.goBack()
					} catch (e: any) {
						Alert.alert(t('error'), e.message)
					}
				}
			}
		])
	}, [friendshipId, removeFriend, navigation, t])

	const handleBlock = useCallback(() => {
		Alert.alert(t('blockUser'), t('blockUserConfirm'), [
			{ text: t('cancel'), style: 'cancel' },
			{
				text: t('block'),
				style: 'destructive',
				onPress: async () => {
					try {
						await blockUser({
							variables: { targetUserId: friendUserId }
						})
						navigation.goBack()
					} catch (e: any) {
						Alert.alert(t('error'), e.message)
					}
				}
			}
		])
	}, [friendUserId, blockUser, navigation, t])

	if (isLoadingProfile || !user) {
		return <FriendProfileSkeleton />
	}

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			{/* Header with back button */}
			<View
				className='flex-row items-center px-4 pt-14 pb-3'
				style={{
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
					{t('friendProfile')}
				</Text>
			</View>

			<ScrollView
				className='flex-1'
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
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
							name={username}
							avatarUrl={avatarUrl}
							size='xl'
						/>
					</View>
					<Text
						className='text-2xl font-bold mt-4'
						style={{ color: colors.text }}
					>
						{username}
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
							@{username}
						</Text>
						<Copy size={12} color={colors.textMuted} />
					</TouchableOpacity>
				</View>

				{/* Friend since badge */}
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

				{/* Action buttons */}
				<View className='mx-5'>
					<Text
						className='text-xs font-semibold uppercase tracking-wider mb-3 ml-1'
						style={{ color: colors.textMuted }}
					>
						{t('actions')}
					</Text>

					{/* Send message */}
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={handleSendMessage}
						className='flex-row items-center px-4 py-4 rounded-2xl mb-2'
						style={{
							backgroundColor: colors.accent
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
						className='flex-row items-center px-4 py-4 rounded-2xl mb-2'
						style={{
							backgroundColor: '#1B5E20'
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
								@{username}
							</Text>
						</View>
					</TouchableOpacity>

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
								backgroundColor: colors.destructive + '18'
							}}
						>
							<UserMinus size={18} color={colors.destructive} />
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
						className='flex-row items-center px-4 py-4 rounded-2xl'
						style={{
							backgroundColor: colors.backgroundSecondary,
							borderWidth: 1,
							borderColor: colors.border
						}}
					>
						<View
							className='w-9 h-9 rounded-full items-center justify-center mr-3'
							style={{
								backgroundColor: colors.destructive + '18'
							}}
						>
							<Shield size={18} color={colors.destructive} />
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
				</View>
			</ScrollView>
		</View>
	)
}

export default FriendProfile
