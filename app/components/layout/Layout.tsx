import cn from 'clsx'
import { FC, PropsWithChildren, ReactNode } from 'react'
import { View } from 'react-native'

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
	return (
		<View
			className={cn('flex-1 w-full bg-card-dark', className)}
			style={
				centered
					? {
							justifyContent: 'center',
							alignItems: 'center',
							paddingHorizontal: 16,
							paddingTop: 48
						}
					: { paddingHorizontal: 16, paddingTop: 48 }
			}
		>
			{children}
		</View>
	)
}

export default Layout
