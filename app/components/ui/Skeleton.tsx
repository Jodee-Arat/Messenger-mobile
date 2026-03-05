import { LinearGradient } from 'expo-linear-gradient'
import React, { FC, useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, ViewStyle } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

interface SkeletonBoxProps {
	width?: number | string
	height?: number
	borderRadius?: number
	style?: ViewStyle
}

/**
 * Анимированный shimmer-блок. Используется как строительный элемент
 * для составных скелетонов каждого экрана.
 */
export const SkeletonBox: FC<SkeletonBoxProps> = ({
	width = '100%',
	height = 16,
	borderRadius = 8,
	style
}) => {
	const { isDark } = useTheme()
	const shimmer = useRef(new Animated.Value(0)).current

	useEffect(() => {
		const loop = Animated.loop(
			Animated.timing(shimmer, {
				toValue: 1,
				duration: 1200,
				useNativeDriver: true
			})
		)
		loop.start()
		return () => loop.stop()
	}, [shimmer])

	const baseColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
	const highlightColor = isDark
		? 'rgba(255,255,255,0.12)'
		: 'rgba(0,0,0,0.11)'

	const translateX = shimmer.interpolate({
		inputRange: [0, 1],
		outputRange: [-200, 200]
	})

	return (
		<View
			style={[
				{
					width: width as any,
					height,
					borderRadius,
					backgroundColor: baseColor,
					overflow: 'hidden'
				},
				style
			]}
		>
			<Animated.View
				style={[
					StyleSheet.absoluteFill,
					{ transform: [{ translateX }] }
				]}
			>
				<LinearGradient
					colors={['transparent', highlightColor, 'transparent']}
					start={{ x: 0, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
		</View>
	)
}

// ─── Составные примитивы ────────────────────────────────────

/** Круглый скелетон (аватар) */
export const SkeletonCircle: FC<{
	size?: number
	style?: ViewStyle
}> = ({ size = 44, style }) => (
	<SkeletonBox
		width={size}
		height={size}
		borderRadius={size / 2}
		style={style}
	/>
)

/** Строка текста */
export const SkeletonLine: FC<{
	width?: number | string
	height?: number
	style?: ViewStyle
}> = ({ width = '100%', height = 14, style }) => (
	<SkeletonBox width={width} height={height} borderRadius={4} style={style} />
)

/** Элемент списка: аватар + две строки текста */
export const SkeletonListItem: FC<{ style?: ViewStyle }> = ({ style }) => (
	<View
		style={[
			{
				flexDirection: 'row',
				alignItems: 'center',
				paddingHorizontal: 16,
				paddingVertical: 12
			},
			style
		]}
	>
		<SkeletonCircle size={48} />
		<View style={{ flex: 1, marginLeft: 12 }}>
			<SkeletonLine width='55%' height={14} />
			<SkeletonLine width='80%' height={11} style={{ marginTop: 8 }} />
		</View>
	</View>
)

/** Карточка-блок  */
export const SkeletonCard: FC<{
	height?: number
	style?: ViewStyle
}> = ({ height = 120, style }) => {
	const { colors } = useTheme()
	return (
		<View
			style={[
				{
					marginHorizontal: 16,
					marginVertical: 8,
					borderRadius: 16,
					backgroundColor: colors.card,
					padding: 16,
					height
				},
				style
			]}
		>
			<SkeletonLine width='40%' height={16} />
			<SkeletonLine width='90%' height={12} style={{ marginTop: 12 }} />
			<SkeletonLine width='70%' height={12} style={{ marginTop: 8 }} />
		</View>
	)
}

export default SkeletonBox
