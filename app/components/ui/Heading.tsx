import cn from 'clsx'
import { FC, PropsWithChildren } from 'react'
import { Text } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

interface IHeading {
	isCenter?: boolean
	className?: string
}

const Heading: FC<PropsWithChildren<IHeading>> = ({
	children,
	isCenter = false,
	className
}) => {
	const { colors } = useTheme()

	return (
		<Text
			className={cn(
				'font-medium text-xl mt-6',
				isCenter && 'text-center',
				className
			)}
			style={{ color: colors.text }}
		>
			{children}
		</Text>
	)
}

export default Heading
