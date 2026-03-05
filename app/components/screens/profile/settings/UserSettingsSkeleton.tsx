import React from 'react'
import { Dimensions, ScrollView, View } from 'react-native'

import { SkeletonBox, SkeletonLine } from '@/components/ui/Skeleton'

import { useTheme } from '@/hooks/useTheme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

/**
 * Скелетон для UserSettings — табы + формы.
 */
const UserSettingsSkeleton = () => {
	const { colors } = useTheme()

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 16,
					paddingTop: 52,
					paddingBottom: 14,
					borderBottomWidth: 1,
					borderBottomColor: colors.borderLight
				}}
			>
				<SkeletonBox width={36} height={36} borderRadius={18} />
				<SkeletonLine
					width={120}
					height={18}
					style={{ marginLeft: 12 }}
				/>
			</View>

			{/* Tabs */}
			<View
				style={{
					flexDirection: 'row',
					paddingHorizontal: 16,
					marginTop: 16,
					gap: 10
				}}
			>
				{[1, 2, 3].map(i => (
					<SkeletonBox
						key={i}
						width={100}
						height={36}
						borderRadius={18}
					/>
				))}
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					padding: 20,
					paddingBottom: 40
				}}
			>
				{/* Avatar area */}
				<View style={{ alignItems: 'center', marginBottom: 24 }}>
					<SkeletonBox width={90} height={90} borderRadius={45} />
					<SkeletonBox
						width={100}
						height={28}
						borderRadius={14}
						style={{ marginTop: 12 }}
					/>
				</View>

				{/* Form fields */}
				{[1, 2, 3, 4].map(i => (
					<View key={i} style={{ marginBottom: 18 }}>
						<SkeletonLine
							width='25%'
							height={12}
							style={{ marginBottom: 8 }}
						/>
						<SkeletonBox
							width='100%'
							height={44}
							borderRadius={10}
						/>
					</View>
				))}

				{/* Save button */}
				<SkeletonBox
					width='100%'
					height={48}
					borderRadius={12}
					style={{ marginTop: 8 }}
				/>
			</ScrollView>
		</View>
	)
}

export default UserSettingsSkeleton
