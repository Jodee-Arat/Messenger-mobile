import React from 'react'
import { View } from 'react-native'

import {
	SkeletonBox,
	SkeletonCircle,
	SkeletonLine
} from '@/components/ui/Skeleton'

import { useTheme } from '@/hooks/useTheme'

const HomeSkeleton = () => {
	const { colors } = useTheme()

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					paddingHorizontal: 20,
					paddingTop: 56,
					paddingBottom: 12
				}}
			>
				<SkeletonBox width={36} height={36} borderRadius={18} />
				<SkeletonLine width={120} height={20} />
				<SkeletonBox width={36} height={36} borderRadius={18} />
			</View>

			<View
				style={{
					flexDirection: 'row',
					paddingHorizontal: 16,
					marginTop: 8,
					gap: 10
				}}
			>
				{[1, 2].map(i => (
					<SkeletonBox
						key={i}
						width={160}
						height={44}
						borderRadius={12}
					/>
				))}
			</View>

			<View
				style={{
					flexDirection: 'row',
					paddingHorizontal: 16,
					marginTop: 20,
					gap: 12
				}}
			>
				{[1, 2, 3].map(i => (
					<SkeletonBox
						key={i}
						width={80}
						height={34}
						borderRadius={17}
					/>
				))}
			</View>

			<View style={{ marginTop: 16 }}>
				{[1, 2, 3, 4, 5, 6].map(i => (
					<View
						key={i}
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							paddingHorizontal: 16,
							paddingVertical: 12
						}}
					>
						<SkeletonCircle size={48} />
						<View style={{ flex: 1, marginLeft: 12 }}>
							<SkeletonLine width='45%' height={14} />
							<SkeletonLine
								width='65%'
								height={11}
								style={{ marginTop: 8 }}
							/>
						</View>
						<SkeletonBox width={24} height={24} borderRadius={6} />
					</View>
				))}
			</View>
		</View>
	)
}

export default HomeSkeleton
