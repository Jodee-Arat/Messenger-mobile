import { Lock, Shield, ShieldOff } from 'lucide-react-native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'

type ProtectedScreenStateVariant = 'auth' | 'denied' | 'error'

type ProtectedScreenStateProps = {
	variant?: ProtectedScreenStateVariant
	title: string
	description: string
	primaryActionLabel?: string
	onPrimaryAction?: () => void
	secondaryActionLabel?: string
	onSecondaryAction?: () => void
}

const ProtectedScreenState = ({
	variant = 'denied',
	title,
	description,
	primaryActionLabel,
	onPrimaryAction,
	secondaryActionLabel,
	onSecondaryAction
}: ProtectedScreenStateProps) => {
	const { colors } = useTheme()
	const { top } = useSafeAreaInsets()

	const Icon =
		variant === 'auth'
			? Lock
			: variant === 'error'
				? ShieldOff
				: Shield

	const iconColor =
		variant === 'error'
			? colors.destructive
			: variant === 'auth'
				? colors.accent
				: colors.warning

	const iconBackground =
		variant === 'error'
			? colors.destructiveMuted
			: variant === 'auth'
				? colors.accentMuted
				: colors.backgroundSecondary

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: colors.background,
				paddingTop: top + 8,
				paddingHorizontal: 24,
				paddingBottom: 24
			}}
		>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<View
					style={{
						width: 72,
						height: 72,
						borderRadius: 36,
						backgroundColor: iconBackground,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Icon size={30} color={iconColor} />
				</View>

				<Text
					style={{
						marginTop: 20,
						fontSize: 20,
						fontWeight: '700',
						color: colors.text,
						textAlign: 'center'
					}}
				>
					{title}
				</Text>

				<Text
					style={{
						marginTop: 10,
						fontSize: 14,
						lineHeight: 20,
						color: colors.textMuted,
						textAlign: 'center'
					}}
				>
					{description}
				</Text>

				{primaryActionLabel && onPrimaryAction ? (
					<TouchableOpacity
						onPress={onPrimaryAction}
						activeOpacity={0.7}
						style={{
							marginTop: 20,
							paddingHorizontal: 18,
							paddingVertical: 12,
							borderRadius: 12,
							backgroundColor: colors.accent
						}}
					>
						<Text
							style={{
								color: '#fff',
								fontWeight: '700',
								fontSize: 14
							}}
						>
							{primaryActionLabel}
						</Text>
					</TouchableOpacity>
				) : null}

				{secondaryActionLabel && onSecondaryAction ? (
					<TouchableOpacity
						onPress={onSecondaryAction}
						activeOpacity={0.7}
						style={{
							marginTop: 12,
							paddingHorizontal: 18,
							paddingVertical: 12,
							borderRadius: 12,
							backgroundColor: colors.backgroundSecondary
						}}
					>
						<Text
							style={{
								color: colors.text,
								fontWeight: '700',
								fontSize: 14
							}}
						>
							{secondaryActionLabel}
						</Text>
					</TouchableOpacity>
				) : null}
			</View>
		</View>
	)
}

export default ProtectedScreenState
