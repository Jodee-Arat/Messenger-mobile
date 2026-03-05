import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { TabKey } from '../../../../types/tab-key.type'

interface FriendsTabsProps {
	activeTab: TabKey
	onTabChange: (tab: TabKey) => void
}

const FriendsTabs: FC<FriendsTabsProps> = ({ activeTab, onTabChange }) => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	const tabs: { key: TabKey; label: string }[] = [
		{ key: 'all', label: t('all') },
		{ key: 'pending', label: t('pending') }
	]

	return (
		<View className='flex-row px-4 pt-2 pb-1' style={{ gap: 6 }}>
			{tabs.map(tab => (
				<TouchableOpacity
					key={tab.key}
					onPress={() => onTabChange(tab.key)}
					activeOpacity={0.7}
					className='rounded-full px-4 py-1.5'
					style={{
						backgroundColor:
							activeTab === tab.key
								? colors.accent
								: colors.cardHover
					}}
				>
					<Text
						className='text-xs font-semibold'
						style={{
							color:
								activeTab === tab.key
									? '#fff'
									: colors.textSecondary
						}}
					>
						{tab.label}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	)
}

export default FriendsTabs
