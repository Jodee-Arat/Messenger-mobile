import { Feather } from '@expo/vector-icons'
import { FC } from 'react'
import { Pressable } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

import { IMenuItem, TypeNavigate } from './menu.interface'

interface IMenuItemProps {
	item: IMenuItem
	nav: TypeNavigate
	currentRoute?: string
}

const MenuItem: FC<IMenuItemProps> = ({ currentRoute, item, nav }) => {
	const isActive = currentRoute === item.path
	const { colors } = useTheme()

	return (
		<Pressable
			className='items-center w-[20%]'
			onPress={() => nav(item.path)}
		>
			<Feather
				name={item.iconName}
				size={26}
				color={isActive ? colors.accent : colors.textMuted}
			/>
		</Pressable>
	)
}

export default MenuItem
