import * as ImagePicker from 'expo-image-picker'
import { Platform } from 'react-native'

export const pickAvatarImage = () =>
	ImagePicker.launchImageLibraryAsync({
		mediaTypes: ['images'],
		allowsEditing: Platform.OS !== 'android',
		aspect: [1, 1],
		quality: 0.8
	})
