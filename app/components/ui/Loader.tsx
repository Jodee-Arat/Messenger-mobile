import { FC } from 'react'
import { ActivityIndicator } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

const Loader: FC = () => {
	const { colors } = useTheme()

	return <ActivityIndicator size='large' color={colors.accent} />
}

export default Loader
