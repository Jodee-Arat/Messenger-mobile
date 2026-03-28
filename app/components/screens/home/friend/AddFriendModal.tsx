import { FC } from 'react'
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'

import AppModal from '@/components/ui/AppModal'
import EntityAvatar from '@/components/ui/EntityAvatar'

import { useCenteredModalLayout } from '@/hooks/useModalLayout'
import { useTheme, useTranslation } from '@/hooks/useTheme'

type SearchUser = {
	id: string
	username: string
	avatarUrl?: string | null
	bio?: string | null
}

interface AddFriendModalProps {
	visible: boolean
	searchQuery: string
	users: SearchUser[]
	isLoading: boolean
	errorMessage?: string | null
	onChangeSearchQuery: (text: string) => void
	onSelectUser: (user: SearchUser) => void
	onClose: () => void
}

const AddFriendModal: FC<AddFriendModalProps> = ({
	visible,
	searchQuery,
	users,
	isLoading,
	errorMessage,
	onChangeSearchQuery,
	onSelectUser,
	onClose
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { cardMarginBottom, cardMaxHeight } = useCenteredModalLayout(0.78)
	const trimmedQuery = searchQuery.trim()

	return (
		<AppModal
			visible={visible}
			transparent
			animationType='fade'
			statusBarTranslucent
			navigationBarTranslucent
			onRequestClose={onClose}
		>
			<Pressable
				className='flex-1 justify-center items-center'
				style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
				onPress={onClose}
			>
				<Pressable
					className='w-[88%] rounded-2xl p-5'
					style={{
						backgroundColor: colors.card,
						maxHeight: cardMaxHeight,
						marginBottom: cardMarginBottom
					}}
					onPress={() => {}}
				>
					<Text
						className='text-lg font-bold mb-4'
						style={{ color: colors.text }}
					>
						{t('findPeople')}
					</Text>

					<TextInput
						value={searchQuery}
						onChangeText={onChangeSearchQuery}
						placeholder={t('searchUsers')}
						placeholderTextColor={colors.textMuted}
						autoCapitalize='none'
						autoCorrect={false}
						className='rounded-xl px-4 py-3 text-sm mb-4'
						style={{
							backgroundColor: colors.cardHover,
							color: colors.text,
							borderWidth: 1,
							borderColor: colors.border
						}}
					/>

					<View
						className='rounded-xl mb-4'
						style={{
							backgroundColor: colors.cardHover,
							borderWidth: 1,
							borderColor: colors.border,
							minHeight: 120,
							maxHeight: 320
						}}
					>
						{isLoading && users.length === 0 ? (
							<View className='py-8 items-center justify-center'>
								<ActivityIndicator
									size='small'
									color={colors.accent}
								/>
							</View>
						) : errorMessage ? (
							<View className='px-4 py-5'>
								<Text
									className='text-sm'
									style={{ color: colors.destructive }}
								>
									{errorMessage}
								</Text>
							</View>
						) : users.length === 0 ? (
							<View className='px-4 py-5'>
								<Text
									className='text-sm'
									style={{ color: colors.textMuted }}
								>
									{trimmedQuery
										? t('noUsersFound')
										: t('noSearchResults')}
								</Text>
							</View>
						) : (
							<ScrollView
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps='handled'
							>
								{users.map(user => (
									<TouchableOpacity
										key={user.id}
										activeOpacity={0.7}
										onPress={() => onSelectUser(user)}
										className='flex-row items-center px-4 py-3'
										style={{
											borderBottomWidth: 1,
											borderBottomColor: colors.border
										}}
									>
										<EntityAvatar
											name={user.username}
											avatarUrl={user.avatarUrl}
											size='default'
										/>
										<View className='flex-1 ml-3'>
											<Text
												className='text-sm font-semibold'
												style={{ color: colors.text }}
												numberOfLines={1}
											>
												{user.username}
											</Text>
											{!!user.bio?.trim() && (
												<Text
													className='text-xs mt-1'
													style={{
														color: colors.textMuted
													}}
													numberOfLines={2}
												>
													{user.bio.trim()}
												</Text>
											)}
										</View>
									</TouchableOpacity>
								))}
							</ScrollView>
						)}
					</View>

					<View className='flex-row justify-end' style={{ gap: 10 }}>
						<TouchableOpacity
							onPress={onClose}
							className='px-4 py-2 rounded-xl'
							style={{ backgroundColor: colors.cardHover }}
						>
							<Text style={{ color: colors.textSecondary }}>
								{t('cancel')}
							</Text>
						</TouchableOpacity>
					</View>
				</Pressable>
			</Pressable>
		</AppModal>
	)
}

export default AddFriendModal
