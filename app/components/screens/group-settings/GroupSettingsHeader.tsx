import { ArrowLeft } from 'lucide-react-native'
import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { goBackOrHome } from '@/navigation/navigate'

interface GroupSettingsHeaderProps {
	groupName: string
}

const GroupSettingsHeader: FC<GroupSettingsHeaderProps> = ({ groupName }) => {
	const navigation = useTypedNavigation()
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { top } = useSafeAreaInsets()

	return (
		<View
			className='pb-4 px-4'
			style={{
				paddingTop: top + 8,
				backgroundColor: colors.backgroundSecondary,
				borderBottomWidth: 1,
				borderBottomColor: colors.border
			}}
		>
			<View className='flex-row items-center'>
				<TouchableOpacity
					onPress={() => goBackOrHome(navigation)}
					activeOpacity={0.7}
					className='w-10 h-10 rounded-full items-center justify-center mr-3'
					style={{ backgroundColor: colors.backgroundTertiary }}
				>
					<ArrowLeft size={22} color={colors.text} />
				</TouchableOpacity>
				<View className='flex-1'>
					<Text
						className='text-xl font-bold'
						style={{ color: colors.text }}
						numberOfLines={1}
					>
						{t('groupSettingsTitle')}
					</Text>
					<Text
						className='text-sm mt-0.5'
						style={{ color: colors.textSecondary }}
					>
						{groupName}
					</Text>
				</View>
			</View>
		</View>
	)
}

export default GroupSettingsHeader
