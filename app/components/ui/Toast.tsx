import { FC } from 'react'
import RnToast, { BaseToast } from 'react-native-toast-message'

import { useTheme } from '@/hooks/useTheme'

const Toast: FC = () => {
	const { colors } = useTheme()

	const options = (primaryColor: string) => ({
		style: { backgroundColor: colors.card, borderLeftColor: primaryColor },
		text1Style: {
			color: colors.text,
			fontSize: 16
		},
		text2Style: {
			fontSize: 14,
			color: colors.textSecondary
		}
	})

	return (
		<RnToast
			topOffset={50}
			config={{
				success: props => (
					<BaseToast {...props} {...options(colors.success)} />
				),
				info: props => (
					<BaseToast {...props} {...options(colors.accent)} />
				),
				error: props => (
					<BaseToast {...props} {...options(colors.destructive)} />
				)
			}}
		/>
	)
}

export default Toast
