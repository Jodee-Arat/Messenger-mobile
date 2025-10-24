import cn from 'clsx'
import { FC, PropsWithChildren } from 'react'
import { Text } from 'react-native'

interface IHeading {
	isCenter?: boolean
	className?: string
}

const Heading: FC<PropsWithChildren<IHeading>> = ({
	children,
	isCenter = false,
	className
}) => {
	return (
		<Text
			className={cn(
				'text-foreground-dark font-medium text-xl mt-6',
				isCenter && 'text-center',
				className
			)}
		>
			{children}
		</Text>
	)
}

export default Heading
