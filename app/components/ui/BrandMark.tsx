import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native'

interface BrandMarkProps {
	size?: number
	style?: StyleProp<ViewStyle>
	imageStyle?: StyleProp<ImageStyle>
}

const BrandMark = ({ size = 40, style, imageStyle }: BrandMarkProps) => {
	return (
		<View
			style={[
				{
					width: size,
					height: size,
					alignItems: 'center',
					justifyContent: 'center'
				},
				style
			]}
		>
			<Image
				source={require('../../assets/logo-mark.png')}
				resizeMode='contain'
				style={[
					{
						width: '100%',
						height: '100%'
					},
					imageStyle
				]}
			/>
		</View>
	)
}

export default BrandMark
