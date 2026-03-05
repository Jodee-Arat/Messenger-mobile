import { ArrowLeft, Settings } from 'lucide-react-native'
import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

interface ChatsListHeaderProps {
	groupId: string
	groupName: string
	chatCount: number
}

const ChatsListHeader: FC<ChatsListHeaderProps> = ({
	groupId,
	groupName,
	chatCount
}) => {
	const navigation = useTypedNavigation()
	const { colors } = useTheme()
	const { t } = useTranslation()

	return (
		<View
			className='pt-12 pb-4 px-4'
			style={{
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
					<View className='flex-1'>
						<Text
							className='text-xl font-bold'
							style={{ color: colors.text }}
							numberOfLines={1}
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
				</View>
				<TouchableOpacity
					onPress={() =>
						navigation.navigate('GroupSettings', {
							groupId,
							groupName
						})
					}
					activeOpacity={0.7}
					className='w-10 h-10 rounded-full items-center justify-center'
					style={{ backgroundColor: colors.backgroundTertiary }}
				>
					<Settings size={20} color={colors.textSecondary} />
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default ChatsListHeader
