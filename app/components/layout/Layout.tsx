import cn from 'clsx'
import { FC, PropsWithChildren } from 'react'
import { ScrollView, View } from 'react-native'

interface ILayout {
	className?: string
}

const Layout: FC<PropsWithChildren<ILayout>> = ({ children, className }) => {
	return (
		<View className={cn('flex-1 w-full bg-card-dark', className)}>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 16,
					paddingTop: 48
				}}
				showsVerticalScrollIndicator={false}
			>
				{children}
			</ScrollView>
		</View>
	)
}

export default Layout
