import { type VariantProps, cva } from 'class-variance-authority'
import React, { FC, ReactNode } from 'react'
import { Pressable, Text, TextStyle, ViewStyle } from 'react-native'

import { cn } from '@/utils/tw-merge'

const buttonVariants = cva(
	'flex-row items-center justify-center rounded-md text-sm font-medium disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-primary-dark text-white',
				destructive: 'bg-red-600 text-white',
				outline: 'border border-gray-300 bg-white',
				secondary: 'bg-gray-200 text-black',
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
	className?: string
}

const Button: FC<ButtonProps> = ({
	children,
	variant,
	size,
	onPress,
	disabled,
	className
}) => {
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			className={cn(buttonVariants({ variant, size, className }))}
		>
			<Text
				className={cn(
					'text-center',
					variant === 'link' ? 'text-primary underline' : 'text-white'
				)}
			>
				{children}
			</Text>
		</Pressable>
	)
}

export { Button, buttonVariants }
