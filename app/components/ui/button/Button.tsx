import { type VariantProps, cva } from 'class-variance-authority'
import React, { FC, ReactNode } from 'react'
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextStyle,
	ViewStyle
} from 'react-native'

import { useTheme } from '@/hooks/useTheme'

import { cn } from '@/utils/tw-merge'

const buttonVariants = cva(
	'flex-row items-center justify-center rounded-md text-sm font-medium disabled:opacity-50',
	{
		variants: {
			variant: {
				default: '',
				destructive: 'bg-red-600 text-white',
				outline: '',
				secondary: '',
				ghost: 'bg-transparent',
				link: 'bg-transparent underline text-primary'
			},
			size: {
				default: 'h-12 px-4',
				sm: 'h-10 px-3 text-xs',
				lg: 'h-14 px-6',
				icon: 'h-12 w-12'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
)

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
	children: ReactNode
	onPress?: () => void
	disabled?: boolean
	loading?: boolean
	className?: string
	isText?: boolean
}

const Button: FC<ButtonProps> = ({
	children,
	variant,
	size,
	onPress,
	disabled,
	loading,
	className,
	isText = true
}) => {
	const { colors } = useTheme()

	const getVariantStyle = () => {
		switch (variant) {
			case 'outline':
				return {
					borderWidth: 1,
					borderColor: colors.border,
					backgroundColor: colors.card
				}
			case 'secondary':
				return { backgroundColor: colors.backgroundTertiary }
			case 'destructive':
				return { backgroundColor: colors.destructive }
			default:
				return { backgroundColor: colors.accent }
		}
	}

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled || loading}
			className={cn(
				buttonVariants({ variant, size }),
				className,
				(disabled || loading) && 'opacity-70'
			)}
			style={!className?.includes('bg-') ? getVariantStyle() : undefined}
		>
			{loading ? (
				<ActivityIndicator
					size='small'
					color={
						variant === 'destructive' ||
						!variant ||
						variant === 'default'
							? '#ffffff'
							: colors.accent
					}
				/>
			) : isText ? (
				<Text
					className={cn(
						'text-center',
						variant === 'link'
							? 'text-primary underline'
							: 'text-white'
					)}
				>
					{children}
				</Text>
			) : (
				children
			)}
		</Pressable>
	)
}

export { Button, buttonVariants }
