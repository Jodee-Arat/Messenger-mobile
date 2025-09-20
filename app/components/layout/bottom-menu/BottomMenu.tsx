import { FC } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import MenuItem from './MenuItem'
import { menuItems } from './menu.data'
import { TypeNavigate } from './menu.interface'

interface IBottomMenu {
	nav: TypeNavigate
	currentRoute?: string
}

const BottomMenu: FC<IBottomMenu> = ({ nav, currentRoute }) => {
	const { bottom } = useSafeAreaInsets()

	return (
		<View
			className='absolute bottom-0 left-0 right-0 flex-row justify-between items-center'
			style={{
				backgroundColor:
					'hsl(250.73684210526318, 58.28220858895706%, 31.960784313725487%)', // card-dark
				borderTopColor: 'hsl(250, 15%, 30%)', // border-dark
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
