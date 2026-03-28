import { ArrowLeft, Search, Settings, X } from 'lucide-react-native'
import { FC } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

interface ChatsListHeaderProps {
	groupId: string
	groupName: string
	avatarUrl?: string | null
	chatCount: number
	isSearchVisible: boolean
	searchQuery: string
	onSearchToggle: () => void
	onSearchChange: (text: string) => void
}

const ChatsListHeader: FC<ChatsListHeaderProps> = ({
	groupId,
	groupName,
	avatarUrl,
	chatCount,
	isSearchVisible,
	searchQuery,
	onSearchToggle,
	onSearchChange
}) => {
	const navigation = useTypedNavigation()
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { top } = useSafeAreaInsets()

	return (
		<View
			style={{
				paddingTop: top + 12,
				paddingBottom: 16,
				paddingHorizontal: 16,
				backgroundColor: colors.backgroundSecondary,
				borderBottomWidth: 1,
				borderBottomColor: colors.border
			}}
		>
			<View className='flex-row items-center justify-between'>
				<View className='flex-row items-center flex-1'>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						activeOpacity={0.7}
						className='w-10 h-10 rounded-full items-center justify-center mr-3'
						style={{
							backgroundColor: colors.backgroundTertiary
						}}
					>
						<ArrowLeft size={22} color={colors.text} />
					</TouchableOpacity>
					{isSearchVisible ? (
						<View
							className='flex-1 h-10 rounded-xl flex-row items-center px-3'
							style={{
								backgroundColor: colors.backgroundTertiary,
								borderWidth: 1,
								borderColor: colors.border
							}}
						>
							<Search
								size={16}
								color={colors.textSecondary}
								style={{ marginRight: 8 }}
							/>
							<TextInput
								autoFocus
								value={searchQuery}
								onChangeText={onSearchChange}
								placeholder={t('searchChatsPlaceholder')}
								placeholderTextColor={colors.textMuted}
								style={{
									flex: 1,
									color: colors.text,
									paddingVertical: 0
								}}
							/>
						</View>
					) : (
						<>
							<EntityAvatar
								name={groupName}
								avatarUrl={avatarUrl}
								size='default'
							/>
							<View className='flex-1 ml-3'>
								<Text
									className='text-xl font-bold'
									style={{ color: colors.text }}
									numberOfLines={1}
									ellipsizeMode='tail'
								>
									{groupName}
								</Text>
								<Text
									className='text-xs mt-0.5'
									style={{ color: colors.textSecondary }}
								>
									{chatCount}{' '}
									{chatCount === 1
										? t('oneChat')
										: t('numberOfChats')}
								</Text>
							</View>
						</>
					)}
				</View>
				<View className='flex-row items-center'>
					<TouchableOpacity
						onPress={onSearchToggle}
						activeOpacity={0.7}
						className='w-10 h-10 rounded-full items-center justify-center'
						style={{ backgroundColor: colors.backgroundTertiary }}
					>
						{isSearchVisible ? (
							<X size={20} color={colors.textSecondary} />
						) : (
							<Search size={20} color={colors.textSecondary} />
						)}
					</TouchableOpacity>
					{!isSearchVisible && (
						<TouchableOpacity
							onPress={() =>
								navigation.navigate('GroupSettings', {
									groupId,
									groupName
								})
							}
							activeOpacity={0.7}
							className='w-10 h-10 rounded-full items-center justify-center ml-2'
							style={{
								backgroundColor: colors.backgroundTertiary
							}}
						>
							<Settings size={20} color={colors.textSecondary} />
						</TouchableOpacity>
					)}
				</View>
			</View>
		</View>
	)
}

export default ChatsListHeader
