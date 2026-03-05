import { Settings } from 'lucide-react-native'
import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

interface SidebarHeaderProps {
	username?: string
	avatarUrl?: string | null
	onClose: () => void
}

const SidebarHeader: FC<SidebarHeaderProps> = ({
	username,
	avatarUrl,
	onClose
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const navigation = useTypedNavigation()

	return (
		<View
			className='pt-14 pb-4 px-5'
			style={{
				backgroundColor: colors.backgroundSecondary,
				borderBottomWidth: 1,
				borderBottomColor: colors.border
			}}
		>
			<View className='flex-row items-center'>
				<EntityAvatar name={username} avatarUrl={avatarUrl} size='lg' />
				<View className='ml-3 flex-1'>
					<Text
						className='text-lg font-bold'
						style={{ color: colors.text }}
						numberOfLines={1}
					>
						{username ?? t('user')}
					</Text>
					<Text
						className='text-xs'
						style={{ color: colors.textSecondary }}
					>
						{t('online')}
					</Text>
				</View>
				<TouchableOpacity
					onPress={() => {
						onClose()
						setTimeout(() => navigation.navigate('Profile'), 250)
					}}
					activeOpacity={0.6}
					className='w-9 h-9 rounded-full items-center justify-center'
					style={{ backgroundColor: colors.cardHover }}
				>
					<Settings size={18} color={colors.textSecondary} />
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default SidebarHeader
