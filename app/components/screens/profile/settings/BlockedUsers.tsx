import { useFocusEffect } from '@react-navigation/native'
import { ArrowLeft, Shield, ShieldOff } from 'lucide-react-native'
import React, { FC, useCallback, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	RefreshControl,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import EntityAvatar from '@/components/ui/EntityAvatar'

import {
	getGraphQLErrorMessage,
	useBlockedUsers
} from '@/hooks/useBlockedUsers'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { goBackOrHome } from '@/navigation/navigate'

import {
	FindAllChatsByUserDocument,
	GetBlockedUsersDocument,
	GetFriendsDocument,
	useUnblockUserMutation
} from '@/graphql/generated/output'

const BlockedUsers: FC = () => {
	const navigation = useTypedNavigation()
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { top } = useSafeAreaInsets()
	const [pendingUnblockId, setPendingUnblockId] = useState<string | null>(
		null
	)
	const [isRefreshing, setIsRefreshing] = useState(false)

	const { blockedUsers, loading, error, refetch } = useBlockedUsers({
		fetchPolicy: 'network-only'
	})

	const [unblockUser] = useUnblockUserMutation()

	useFocusEffect(
		useCallback(() => {
			void refetch()
		}, [refetch])
	)

	const handleRetry = useCallback(() => {
		void refetch()
	}, [refetch])

	const handleRefresh = useCallback(async () => {
		try {
			setIsRefreshing(true)
			await refetch()
		} finally {
			setIsRefreshing(false)
		}
	}, [refetch])

	const handleUnblock = useCallback(
		(friendshipId: string) => {
			Alert.alert(t('unblockUser'), t('unblockUserConfirm'), [
				{ text: t('cancel'), style: 'cancel' },
				{
					text: t('unblockUser'),
					style: 'destructive',
					onPress: async () => {
						try {
							setPendingUnblockId(friendshipId)
							await unblockUser({
								variables: { friendshipId },
								refetchQueries: [
									GetBlockedUsersDocument,
									GetFriendsDocument,
									{
										query: FindAllChatsByUserDocument,
										variables: { filters: {} }
									}
								],
								awaitRefetchQueries: true
							})
							void refetch()
						} catch (mutationError) {
							Alert.alert(
								t('error'),
								getGraphQLErrorMessage(mutationError) ||
									t('blockedUsersLoadError')
							)
						} finally {
							setPendingUnblockId(null)
						}
					}
				}
			])
		},
		[refetch, t, unblockUser]
	)

	const errorMessage = useMemo(
		() => getGraphQLErrorMessage(error) || t('blockedUsersLoadError'),
		[error, t]
	)

	const renderHeader = () => (
		<View
			style={{
				backgroundColor: colors.backgroundSecondary,
				borderBottomWidth: 1,
				borderBottomColor: colors.border,
				paddingTop: top + 8,
				paddingBottom: 12,
				paddingHorizontal: 16,
				flexDirection: 'row',
				alignItems: 'center'
			}}
		>
			<TouchableOpacity
				onPress={() => goBackOrHome(navigation)}
				activeOpacity={0.7}
				style={{
					width: 40,
					height: 40,
					borderRadius: 20,
					backgroundColor: colors.backgroundTertiary,
					alignItems: 'center',
					justifyContent: 'center',
					marginRight: 12
				}}
			>
				<ArrowLeft size={20} color={colors.text} />
			</TouchableOpacity>

			<View style={{ flex: 1 }}>
				<Text
					style={{
						fontSize: 18,
						fontWeight: '700',
						color: colors.text
					}}
				>
					{t('blockedUsers')}
				</Text>
				<Text
					numberOfLines={1}
					style={{
						fontSize: 12,
						color: colors.textMuted,
						marginTop: 2
					}}
				>
					{t('blockedUsersHint')}
				</Text>
			</View>
		</View>
	)

	if (loading && blockedUsers.length === 0) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.background }}>
				{renderHeader()}
				<View
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
						paddingHorizontal: 24
					}}
				>
					<ActivityIndicator size='large' color={colors.accent} />
					<Text
						style={{
							marginTop: 16,
							fontSize: 14,
							color: colors.textMuted,
							textAlign: 'center'
						}}
					>
						{t('blockedUsersLoading')}
					</Text>
				</View>
			</View>
		)
	}

	if (error && blockedUsers.length === 0) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.background }}>
				{renderHeader()}
				<View
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
						paddingHorizontal: 24
					}}
				>
					<View
						style={{
							width: 64,
							height: 64,
							borderRadius: 32,
							backgroundColor: colors.backgroundSecondary,
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<ShieldOff size={28} color={colors.destructive} />
					</View>
					<Text
						style={{
							marginTop: 16,
							fontSize: 17,
							fontWeight: '700',
							color: colors.text
						}}
					>
						{t('blockedUsersLoadErrorTitle')}
					</Text>
					<Text
						style={{
							marginTop: 8,
							fontSize: 13,
							color: colors.textMuted,
							textAlign: 'center',
							lineHeight: 19
						}}
					>
						{errorMessage}
					</Text>
					<TouchableOpacity
						onPress={handleRetry}
						activeOpacity={0.7}
						style={{
							marginTop: 20,
							paddingHorizontal: 18,
							paddingVertical: 12,
							borderRadius: 12,
							backgroundColor: colors.accent
						}}
					>
						<Text
							style={{
								color: '#fff',
								fontSize: 14,
								fontWeight: '700'
							}}
						>
							{t('retry')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			{renderHeader()}

			<FlatList
				data={blockedUsers}
				keyExtractor={item => item.id}
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingTop: 16,
					paddingBottom: 32,
					flexGrow: 1
				}}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={handleRefresh}
						tintColor={colors.accent}
						colors={[colors.accent]}
						progressBackgroundColor={colors.card}
					/>
				}
				ListEmptyComponent={() => (
					<View
						style={{
							flex: 1,
							alignItems: 'center',
							justifyContent: 'center',
							paddingHorizontal: 24
						}}
					>
						<View
							style={{
								width: 64,
								height: 64,
								borderRadius: 32,
								backgroundColor: colors.backgroundSecondary,
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							<Shield size={28} color={colors.accent} />
						</View>
						<Text
							style={{
								marginTop: 16,
								fontSize: 17,
								fontWeight: '700',
								color: colors.text
							}}
						>
							{t('blockedUsersEmptyTitle')}
						</Text>
						<Text
							style={{
								marginTop: 8,
								fontSize: 13,
								color: colors.textMuted,
								textAlign: 'center',
								lineHeight: 19
							}}
						>
							{t('blockedUsersEmpty')}
						</Text>
					</View>
				)}
				renderItem={({ item }) => {
					const username = item.friend?.username || t('unknownUser')
					const isUnblocking = pendingUnblockId === item.id
					const blockedAt = new Date(item.createdAt).toLocaleDateString(
						'ru-RU',
						{
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						}
					)

					return (
						<View
							style={{
								backgroundColor: colors.card,
								borderRadius: 16,
								borderWidth: 1,
								borderColor: colors.border,
								padding: 14,
								marginBottom: 12,
								flexDirection: 'row',
								alignItems: 'center'
							}}
						>
							<EntityAvatar
								name={username}
								avatarUrl={item.friend?.avatarUrl}
								size='lg'
							/>

							<View style={{ flex: 1, marginLeft: 12, marginRight: 12 }}>
								<Text
									numberOfLines={1}
									style={{
										fontSize: 15,
										fontWeight: '700',
										color: colors.text
									}}
								>
									{username}
								</Text>
								<Text
									numberOfLines={2}
									style={{
										marginTop: 4,
										fontSize: 12,
										color: colors.textMuted
									}}
								>
									{t('blockedOn')} {blockedAt}
								</Text>
							</View>

							<TouchableOpacity
								onPress={() => handleUnblock(item.id)}
								disabled={isUnblocking}
								activeOpacity={0.7}
								style={{
									paddingHorizontal: 14,
									paddingVertical: 10,
									borderRadius: 12,
									backgroundColor: colors.accentMuted,
									minWidth: 96,
									alignItems: 'center',
									justifyContent: 'center',
									opacity: isUnblocking ? 0.7 : 1
								}}
							>
								{isUnblocking ? (
									<ActivityIndicator
										size='small'
										color={colors.accent}
									/>
								) : (
									<Text
										style={{
											fontSize: 13,
											fontWeight: '700',
											color: colors.accent
										}}
									>
										{t('unblockUser')}
									</Text>
								)}
							</TouchableOpacity>
						</View>
					)
				}}
			/>
		</View>
	)
}

export default BlockedUsers
