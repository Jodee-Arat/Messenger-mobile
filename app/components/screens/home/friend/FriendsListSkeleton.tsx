import React from 'react'
import { View } from 'react-native'

import {
	SkeletonBox,
	SkeletonCircle,
	SkeletonLine
} from '@/components/ui/Skeleton'

import { useTheme } from '@/hooks/useTheme'

/**
 * Скелетон для списка друзей (FriendsTabContent) —
 * несколько элементов-строк с аватарами.
 */
const FriendsListSkeleton = () => {
	const { colors } = useTheme()

	return (
		<View style={{ paddingTop: 8 }}>
			{[1, 2, 3, 4, 5].map(i => (
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
	)
}

export default FriendsListSkeleton
