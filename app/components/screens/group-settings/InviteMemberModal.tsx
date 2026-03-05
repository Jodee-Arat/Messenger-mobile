import { Check, Search } from 'lucide-react-native'
import React, { useRef, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	Dimensions,
	Modal,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useUser } from '@/hooks/useUser'

import { useGetFriendsQuery } from '@/graphql/generated/output'

const SCREEN_HEIGHT = Dimensions.get('window').height

interface InviteMemberModalProps {
	isOpen: boolean
	onClose: () => void
	onInvite: (userId: string) => void
	existingMemberIds: string[]
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
	isOpen,
	onClose,
	onInvite,
	existingMemberIds
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { userId } = useUser()
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
	const [searchQuery, setSearchQuery] = useState('')

	const {
		data: friendsData,
		loading: isLoadingUsers,
		refetch: refetchFriends
	} = useGetFriendsQuery({ skip: !isOpen, fetchPolicy: 'cache-and-network' })

	const allFriends = (friendsData?.getFriends ?? [])
		.map(f => {
			const other = f.userId === userId ? f.friend : f.user
			return other
				? {
						id: other.id,
						username: other.username,
						avatarUrl: other.avatarUrl
					}
				: null
		})
		.filter(Boolean) as {
		id: string
		username: string
		avatarUrl?: string | null
	}[]

	const filteredFriends = allFriends.filter(
		friend =>
			friend.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
			!existingMemberIds.includes(friend.id)
	)

	React.useEffect(() => {
		if (isOpen) {
			setSearchQuery('')
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		}
	}, [isOpen])

	const closeSheet = () => {
		Animated.timing(slideAnim, {
			toValue: SCREEN_HEIGHT,
			duration: 200,
			useNativeDriver: true
		}).start(() => {
			onClose()
		})
	}

	const handleInvite = (userId: string) => {
		onInvite(userId)
		closeSheet()
	}

	return (
		<Modal
			visible={isOpen}
			transparent
			animationType='none'
			onRequestClose={closeSheet}
		>
			<View className='flex-1'>
				<Pressable
					className='flex-1'
					style={{ backgroundColor: colors.overlay }}
					onPress={closeSheet}
				/>

				<Animated.View
					style={{
						transform: [{ translateY: slideAnim }],
						backgroundColor: colors.backgroundSecondary,
						borderTopLeftRadius: 20,
						borderTopRightRadius: 20,
						borderTopWidth: 1,
						borderColor: colors.border,
						paddingBottom: 34,
						paddingTop: 8,
						maxHeight: SCREEN_HEIGHT * 0.7
					}}
				>
					{/* Handle */}
					<View className='items-center mb-3'>
						<View
							style={{
								width: 36,
								height: 4,
								borderRadius: 2,
								backgroundColor: colors.textMuted
							}}
						/>
					</View>

					<Text
						className='text-lg font-bold px-5 mb-3'
						style={{ color: colors.text }}
					>
						{t('inviteMember')}
					</Text>

					{/* Search */}
					<View
						className='mx-5 mb-3 flex-row items-center rounded-xl px-3'
						style={{
							backgroundColor: colors.backgroundTertiary,
							borderWidth: 1,
							borderColor: colors.border
						}}
					>
						<Search
							size={16}
							color={colors.textMuted}
							style={{ marginRight: 8 }}
						/>
						<TextInput
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholder={t('searchUsers')}
							placeholderTextColor={colors.textMuted}
							className='flex-1 py-2.5 text-sm'
							style={{ color: colors.text }}
						/>
					</View>

					<ScrollView
						showsVerticalScrollIndicator={false}
						className='px-4'
						keyboardShouldPersistTaps='handled'
					>
						{isLoadingUsers ? (
							<View className='py-6 items-center'>
								<ActivityIndicator
									size='small'
									color={colors.accent}
								/>
							</View>
						) : filteredFriends.length === 0 ? (
							<Text
								className='text-sm text-center py-6'
								style={{ color: colors.textMuted }}
							>
								{t('noUsersFound')}
							</Text>
						) : (
							filteredFriends.map(friend => {
								const isMember = existingMemberIds.includes(
									friend.id
								)

								return (
									<TouchableOpacity
										key={friend.id}
										activeOpacity={isMember ? 1 : 0.6}
										onPress={() =>
											!isMember && handleInvite(friend.id)
										}
										className='flex-row items-center px-4 py-3 rounded-xl mb-2'
										style={{
											backgroundColor:
												colors.backgroundTertiary,
											borderWidth: 1,
											borderColor: colors.border,
											opacity: isMember ? 0.5 : 1
										}}
									>
										<EntityAvatar
											name={friend.username}
											avatarUrl={friend.avatarUrl}
											size='default'
										/>
										<View className='flex-1 ml-3'>
											<Text
												className='text-sm font-semibold'
												style={{
													color: colors.text
												}}
											>
												{friend.username}
											</Text>
										</View>
										{isMember ? (
											<View
												className='px-2.5 py-1 rounded-full'
												style={{
													backgroundColor:
														colors.successMuted
												}}
											>
												<Text
													className='text-xs font-semibold'
													style={{
														color: colors.success
													}}
												>
													{t('alreadyMember')}
												</Text>
											</View>
										) : (
											<View
												className='px-3 py-1.5 rounded-full'
												style={{
													backgroundColor:
														colors.accent
												}}
											>
												<Text
													className='text-xs font-semibold'
													style={{
														color: colors.text
													}}
												>
													{t('invite')}
												</Text>
											</View>
										)}
									</TouchableOpacity>
								)
							})
						)}
					</ScrollView>
				</Animated.View>
			</View>
		</Modal>
	)
}

export default InviteMemberModal
