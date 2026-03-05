import React from 'react'
import { View } from 'react-native'

import {
	SkeletonBox,
	SkeletonCircle,
	SkeletonLine
} from '@/components/ui/Skeleton'

import { useTheme } from '@/hooks/useTheme'

const GroupsListSkeleton = () => {
	const { colors } = useTheme()

	return (
		<View style={{ paddingTop: 4 }}>
			{[1, 2, 3, 4, 5].map(i => (
				<View
					key={i}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						paddingHorizontal: 20,
						paddingVertical: 10
					}}
				>
					<SkeletonCircle size={44} />
					<View style={{ flex: 1, marginLeft: 12 }}>
						<SkeletonLine width='55%' height={14} />
						<SkeletonLine
							width='35%'
							height={11}
							style={{ marginTop: 6 }}
						/>
					</View>
				</View>
			))}
		</View>
	)
}

export default GroupsListSkeleton
