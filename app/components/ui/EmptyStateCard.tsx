import { LinearGradient } from 'expo-linear-gradient'
import React, { ComponentType, ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

type IconComponent = ComponentType<{
	size?: number
	color?: string
	strokeWidth?: number
}>

interface EmptyStateCardProps {
	icon: IconComponent
	title: string
	description?: string
	size?: 'sm' | 'md'
	children?: ReactNode
}

const EmptyStateCard = ({
	icon: Icon,
	title,
	description,
	size = 'md',
	children
}: EmptyStateCardProps) => {
	const { colors } = useTheme()
	const isSmall = size === 'sm'

	return (
		<View
			style={{
				overflow: 'hidden',
				borderRadius: isSmall ? 20 : 24,
				borderWidth: 1,
				borderStyle: 'dashed',
				borderColor: colors.borderLight,
				backgroundColor: colors.card
			}}
		>
			<LinearGradient
				colors={[colors.accentMuted, 'transparent']}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				style={StyleSheet.absoluteFillObject}
			/>

			<View
				style={{
					paddingHorizontal: isSmall ? 18 : 24,
					paddingVertical: isSmall ? 20 : 28,
					alignItems: 'center'
				}}
			>
				<View
					style={{
						width: isSmall ? 44 : 56,
						height: isSmall ? 44 : 56,
						borderRadius: isSmall ? 16 : 20,
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: colors.accentMuted,
						borderWidth: 1,
						borderColor: colors.borderLight
					}}
				>
					<Icon
						size={isSmall ? 20 : 24}
						color={colors.accent}
						strokeWidth={2}
					/>
				</View>

				<Text
					style={{
						marginTop: 12,
						fontSize: isSmall ? 14 : 16,
						lineHeight: isSmall ? 20 : 22,
						fontWeight: '700',
						textAlign: 'center',
						color: colors.text
					}}
				>
					{title}
				</Text>

				{description ? (
					<Text
						style={{
							marginTop: 6,
							fontSize: isSmall ? 12 : 13,
							lineHeight: isSmall ? 18 : 20,
							textAlign: 'center',
							color: colors.textMuted
						}}
					>
						{description}
					</Text>
				) : null}

				{children ? <View style={{ marginTop: 12 }}>{children}</View> : null}
			</View>
		</View>
	)
}

export default EmptyStateCard
