import React from 'react'
import { View } from 'react-native'

import {
	SkeletonBox,
	SkeletonCircle,
	SkeletonLine
} from '@/components/ui/Skeleton'

import { useTheme } from '@/hooks/useTheme'

/**
 * Скелетон для списка чатов (ChatsList / DirectMessages) —
 * header + скелетоны элементов чата.
 */
const ChatsListSkeleton = () => {
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
				<View style={{ flex: 1, marginLeft: 12 }}>
					<SkeletonLine width='50%' height={18} />
					<SkeletonLine
						width='25%'
						height={12}
						style={{ marginTop: 6 }}
					/>
				</View>
				<SkeletonBox width={36} height={36} borderRadius={18} />
			</View>

			{/* Chat items */}
			{[1, 2, 3, 4, 5, 6, 7].map(i => (
				<View
					key={i}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						paddingHorizontal: 16,
						paddingVertical: 14
					}}
				>
					<SkeletonCircle size={52} />
					<View style={{ flex: 1, marginLeft: 12 }}>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center'
							}}
						>
							<SkeletonLine width='50%' height={15} />
							<SkeletonLine width={40} height={11} />
						</View>
						<SkeletonLine
							width='75%'
							height={12}
							style={{ marginTop: 8 }}
						/>
					</View>
				</View>
			))}
		</View>
	)
}

export default ChatsListSkeleton
