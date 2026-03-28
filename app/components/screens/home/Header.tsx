import { Menu, Search, X } from 'lucide-react-native'
import { FC } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme, useTranslation } from '@/hooks/useTheme'

interface HeaderProps {
	onMenuPress: () => void
	isSearchVisible: boolean
	searchQuery: string
	onSearchPress: () => void
	onSearchChange: (text: string) => void
	onSearchClose: () => void
}

const Header: FC<HeaderProps> = ({
	onMenuPress,
	isSearchVisible,
	searchQuery,
	onSearchPress,
	onSearchChange,
	onSearchClose
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { top } = useSafeAreaInsets()

	return (
		<View
			className='flex-row items-center justify-between px-5 pb-3'
			style={{
				paddingTop: top + 12,
				backgroundColor: colors.backgroundSecondary,
				borderBottomWidth: 1,
				borderBottomColor: colors.border
			}}
		>
			<TouchableOpacity
				onPress={onMenuPress}
				activeOpacity={0.6}
				className='w-10 h-10 rounded-full items-center justify-center'
				style={{ backgroundColor: colors.backgroundTertiary }}
			>
				<Menu size={20} color={colors.text} />
			</TouchableOpacity>

			{isSearchVisible ? (
				<View
					className='flex-1 mx-3 h-10 rounded-xl flex-row items-center px-3'
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
						placeholder={t('searchFriendsPlaceholder')}
						placeholderTextColor={colors.textMuted}
						style={{
							flex: 1,
							color: colors.text,
							paddingVertical: 0
						}}
					/>
				</View>
			) : (
				<Text
					className='text-lg font-bold'
					style={{ color: colors.text }}
				>
					{t('friends')}
				</Text>
			)}

			<TouchableOpacity
				onPress={isSearchVisible ? onSearchClose : onSearchPress}
				activeOpacity={0.6}
				className='w-10 h-10 rounded-full items-center justify-center'
				style={{ backgroundColor: colors.backgroundTertiary }}
			>
				{isSearchVisible ? (
					<X size={20} color={colors.textSecondary} />
				) : (
					<Search size={20} color={colors.textSecondary} />
				)}
			</TouchableOpacity>
		</View>
	)
}

export default Header
