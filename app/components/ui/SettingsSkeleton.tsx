import React from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
	SkeletonBox,
	SkeletonCircle,
	SkeletonLine,
	SkeletonListItem
} from '@/components/ui/Skeleton'

import { useTheme } from '@/hooks/useTheme'

/**
 * Скелетон для настроек чата / группы — header, info-card,
 * секция ролей, секция участников.
 */
const SettingsSkeleton = () => {
	const { colors } = useTheme()
	const { top } = useSafeAreaInsets()

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 16,
					paddingTop: top + 8,
					paddingBottom: 14,
					borderBottomWidth: 1,
					borderBottomColor: colors.borderLight
				}}
			>
				<SkeletonBox width={36} height={36} borderRadius={18} />
				<SkeletonLine
					width={140}
					height={18}
					style={{ marginLeft: 12 }}
				/>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
			>
				{/* Info card */}
				<View
					style={{
						alignItems: 'center',
						paddingVertical: 24,
						paddingHorizontal: 20
					}}
				>
					<SkeletonCircle size={80} />
					<SkeletonLine
						width={160}
						height={18}
						style={{ marginTop: 14 }}
					/>
					<SkeletonLine
						width={220}
						height={13}
						style={{ marginTop: 8 }}
					/>
					<SkeletonBox
						width={100}
						height={32}
						borderRadius={16}
						style={{ marginTop: 14 }}
					/>
				</View>

				{/* Divider */}
				<View
					style={{
						height: 1,
						backgroundColor: colors.borderLight,
						marginHorizontal: 16,
						marginVertical: 4
					}}
				/>

				{/* Roles section */}
				<View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
					<SkeletonLine
						width={80}
						height={12}
						style={{ marginBottom: 12 }}
					/>
					{[1, 2, 3].map(i => (
						<View
							key={i}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor: colors.card,
								borderRadius: 12,
								padding: 14,
								marginBottom: 8
							}}
						>
							<SkeletonBox
								width={12}
								height={12}
								borderRadius={6}
							/>
							<SkeletonLine
								width='40%'
								height={14}
								style={{ marginLeft: 10 }}
							/>
						</View>
					))}
				</View>

				{/* Divider */}
				<View
					style={{
						height: 1,
						backgroundColor: colors.borderLight,
						marginHorizontal: 16,
						marginVertical: 12
					}}
				/>

				{/* Members section */}
				<View style={{ paddingTop: 4 }}>
					<SkeletonLine
						width={110}
						height={12}
						style={{ marginBottom: 8, marginLeft: 16 }}
					/>
					{[1, 2, 3, 4].map(i => (
						<SkeletonListItem key={i} />
					))}
				</View>
			</ScrollView>
		</View>
	)
}

export default SettingsSkeleton
