import { FC } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'

import MenuItem from './MenuItem'
import { menuItems } from './menu.data'
import { TypeNavigate } from './menu.interface'

interface IBottomMenu {
	nav: TypeNavigate
	currentRoute?: string
}

const BottomMenu: FC<IBottomMenu> = ({ nav, currentRoute }) => {
	const { bottom } = useSafeAreaInsets()
	const { colors } = useTheme()

	return (
		<View
			className='absolute bottom-0 left-0 right-0 flex-row justify-between items-center'
			style={{
				backgroundColor: colors.backgroundSecondary,
				borderTopColor: colors.border,
				borderTopWidth: 1,
				paddingVertical: 12,
				paddingBottom: bottom + 12
			}}
		>
			{menuItems.map(item => {
				const isActive = currentRoute === item.path
				return (
					<MenuItem
						key={item.path}
						item={item}
						nav={nav}
						currentRoute={currentRoute}
					/>
				)
			})}
		</View>
	)
}

export default BottomMenu
