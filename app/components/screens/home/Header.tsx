import { Menu, Search } from 'lucide-react-native'
import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'

interface HeaderProps {
	onMenuPress: () => void
}

const Header: FC<HeaderProps> = ({ onMenuPress }) => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	return (
		<View
			className='flex-row items-center justify-between px-5 pt-14 pb-3'
			style={{
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

			<Text className='text-lg font-bold' style={{ color: colors.text }}>
				{t('friends')}
			</Text>

			<TouchableOpacity
				activeOpacity={0.6}
				className='w-10 h-10 rounded-full items-center justify-center'
				style={{ backgroundColor: colors.backgroundTertiary }}
			>
				<Search size={20} color={colors.textSecondary} />
			</TouchableOpacity>
		</View>
	)
}

export default Header
