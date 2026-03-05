import cn from 'clsx'
import { FC, PropsWithChildren, ReactNode } from 'react'
import { View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

interface ILayout {
	className?: string
	centered?: boolean
	children: ReactNode
}

const Layout: FC<PropsWithChildren<ILayout>> = ({
	children,
	className,
	centered = false
}) => {
	const { colors } = useTheme()

	return (
		<View
			className={cn('flex-1 w-full', className)}
			style={[
				{ backgroundColor: colors.card },
				centered
					? {
							justifyContent: 'center',
							alignItems: 'center',
							paddingHorizontal: 16,
							paddingTop: 48
						}
					: { paddingHorizontal: 16, paddingTop: 48 }
			]}
		>
			{children}
		</View>
	)
}

export default Layout
