import React from 'react'
import { View } from 'react-native'

import {
	SkeletonBox,
	SkeletonCircle,
	SkeletonLine
} from '@/components/ui/Skeleton'

import { useTheme } from '@/hooks/useTheme'

/**
 * Скелетон для экрана профиля друга —
 * аватар, имя, кнопки действий, инфо-блоки.
 */
const FriendProfileSkeleton = () => {
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
					paddingBottom: 14
				}}
			>
				<SkeletonBox width={36} height={36} borderRadius={18} />
				<SkeletonLine
					width={100}
					height={18}
					style={{ marginLeft: 12 }}
				/>
			</View>

			{/* Avatar + name */}
			<View style={{ alignItems: 'center', marginTop: 20 }}>
				<SkeletonCircle size={96} />
				<SkeletonLine
					width={130}
					height={20}
					style={{ marginTop: 16 }}
				/>
				<SkeletonLine
					width={180}
					height={13}
					style={{ marginTop: 8 }}
				/>
			</View>

			{/* Action buttons */}
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'center',
					gap: 12,
					marginTop: 24,
					paddingHorizontal: 20
				}}
			>
				<SkeletonBox width={140} height={44} borderRadius={12} />
				<SkeletonBox width={140} height={44} borderRadius={12} />
			</View>

			{/* Info cards */}
			<View style={{ marginTop: 28, paddingHorizontal: 20 }}>
				{[1, 2, 3].map(i => (
					<View
						key={i}
						style={{
							backgroundColor: colors.card,
							borderRadius: 14,
							padding: 16,
							marginBottom: 10,
							flexDirection: 'row',
							alignItems: 'center'
						}}
					>
						<SkeletonBox width={36} height={36} borderRadius={10} />
						<View style={{ flex: 1, marginLeft: 14 }}>
							<SkeletonLine width='45%' height={13} />
							<SkeletonLine
								width='65%'
								height={11}
								style={{ marginTop: 6 }}
							/>
						</View>
					</View>
				))}
			</View>
		</View>
	)
}

export default FriendProfileSkeleton
