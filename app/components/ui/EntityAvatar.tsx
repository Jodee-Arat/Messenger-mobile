import { type VariantProps, cva } from 'class-variance-authority'
import { memo } from 'react'
import { Image, Text, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

import { getMediaSource } from '@/utils/get-media-source'
import { cn } from '@/utils/tw-merge'

const avatarSizes = cva('', {
	variants: {
		size: {
			sm: 'w-7 h-7 rounded-full',
			default: 'w-9 h-9 rounded-full',
			lg: 'w-12 h-12 rounded-full',
			xl: 'w-32 h-32 rounded-full'
		}
	},
	defaultVariants: {
		size: 'default'
	}
})

interface EntityAvatarProps extends VariantProps<typeof avatarSizes> {
	name?: string | null
	avatarUrl?: string | null
}

const EntityAvatar = memo(({ size, name, avatarUrl }: EntityAvatarProps) => {
	const firstLetter = name?.[0] ?? ''
	const { colors } = useTheme()

	return (
		<View className='relative items-center justify-center'>
			<View
				className={cn(
					avatarSizes({ size }),
					'overflow-hidden items-center justify-center'
				)}
				style={{ backgroundColor: colors.backgroundTertiary }}
			>
				{avatarUrl ? (
					<Image
						source={{ uri: getMediaSource(avatarUrl) }}
						className='w-full h-full object-cover'
					/>
				) : (
					<Text
						className={cn(
							size === 'xl' ? 'text-4xl' : 'text-base',
							'pb-1'
						)}
						style={{ color: colors.text }}
					>
						{firstLetter}
					</Text>
				)}
			</View>
		</View>
	)
})

export default EntityAvatar
