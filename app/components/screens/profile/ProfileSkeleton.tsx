import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Dimensions, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
	SkeletonBox,
	SkeletonCircle,
	SkeletonLine,
	SkeletonListItem
} from '@/components/ui/Skeleton'

import { useTheme } from '@/hooks/useTheme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

/**
 * Скелетон для экрана профиля — градиентный header с аватаром,
 * строки информации и карточки действий.
 */
const ProfileSkeleton = () => {
	const { colors } = useTheme()
	const { top } = useSafeAreaInsets()

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Gradient header area */}
				<LinearGradient
					colors={[
						colors.gradientStart,
						colors.gradientMid,
						colors.gradientEnd
					]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={{
						width: SCREEN_WIDTH,
						paddingTop: top + 24,
						paddingBottom: 60,
						alignItems: 'center'
					}}
				>
					{/* Back + Settings placeholders */}
					<View
						style={{
							position: 'absolute',
							top: top + 12,
							left: 20
						}}
					>
						<SkeletonBox width={40} height={40} borderRadius={20} />
					</View>
					<View
						style={{
							position: 'absolute',
							top: top + 12,
							right: 20
						}}
					>
						<SkeletonBox width={40} height={40} borderRadius={20} />
					</View>

					{/* Avatar */}
					<SkeletonCircle size={100} style={{ marginTop: 20 }} />

					{/* Username */}
					<SkeletonLine
						width={140}
						height={20}
						style={{ marginTop: 16 }}
					/>

					{/* Bio */}
					<SkeletonLine
						width={200}
						height={13}
						style={{ marginTop: 10 }}
					/>

					{/* Online badge */}
					<SkeletonBox
						width={80}
						height={24}
						borderRadius={12}
						style={{ marginTop: 12 }}
					/>
				</LinearGradient>

				{/* Info cards */}
				<View style={{ paddingHorizontal: 20, marginTop: -30 }}>
					{/* Stats card */}
					<View
						style={{
							backgroundColor: colors.card,
							borderRadius: 16,
							padding: 20,
							marginBottom: 12
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-around'
							}}
						>
							{[1, 2, 3].map(i => (
								<View key={i} style={{ alignItems: 'center' }}>
									<SkeletonLine width={36} height={22} />
									<SkeletonLine
										width={50}
										height={11}
										style={{ marginTop: 6 }}
									/>
								</View>
							))}
						</View>
					</View>

					{/* Menu items */}
					{[1, 2, 3, 4].map(i => (
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
							<SkeletonBox
								width={38}
								height={38}
								borderRadius={10}
							/>
							<View style={{ flex: 1, marginLeft: 14 }}>
								<SkeletonLine width='50%' height={14} />
								<SkeletonLine
									width='30%'
									height={11}
									style={{ marginTop: 6 }}
								/>
							</View>
							<SkeletonBox
								width={20}
								height={20}
								borderRadius={4}
							/>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	)
}

export default ProfileSkeleton
