import { Platform, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useKeyboardInset } from './useKeyboardInset'

const MIN_BOTTOM_PADDING = 16
const SHEET_VERTICAL_MARGIN = 24
const CARD_VERTICAL_MARGIN = 48

export const useBottomSheetModalLayout = (maxHeightRatio: number) => {
	const { bottom } = useSafeAreaInsets()
	const { height: windowHeight } = useWindowDimensions()
	const keyboardInset = useKeyboardInset()

	const isKeyboardVisible = keyboardInset > 0

	// On Android, overlay modals (AppModalProvider) may not be resized by adjustResize,
	// so we push the sheet up manually by the keyboard height minus safe area bottom.
	const keyboardOffset =
		Platform.OS === 'android' && isKeyboardVisible
			? Math.max(keyboardInset - bottom, 0)
			: 0

	// When keyboard is visible it covers the safe area bottom (home indicator / nav bar),
	// so use minimal padding instead of the full inset — fixes ~20 px gap on iOS.
	const sheetPaddingBottom = isKeyboardVisible
		? MIN_BOTTOM_PADDING
		: Math.max(bottom, MIN_BOTTOM_PADDING)

	// Available height must account for keyboard offset so the sheet doesn't overflow
	// behind the keyboard on Android.
	const availableHeight = windowHeight - keyboardOffset

	return {
		windowHeight,
		containerPaddingBottom: keyboardOffset,
		sheetPaddingBottom,
		sheetMaxHeight: Math.min(
			availableHeight * maxHeightRatio,
			Math.max(availableHeight - SHEET_VERTICAL_MARGIN, 0)
		)
	}
}

export const useCenteredModalLayout = (maxHeightRatio: number) => {
	const { bottom } = useSafeAreaInsets()
	const { height: windowHeight } = useWindowDimensions()
	const keyboardInset = useKeyboardInset()

	const isKeyboardVisible = keyboardInset > 0

	const keyboardOffset =
		Platform.OS === 'android' && isKeyboardVisible
			? Math.max(keyboardInset - bottom, 0)
			: 0

	const availableHeight = windowHeight - keyboardOffset

	return {
		cardMarginBottom: keyboardOffset,
		cardMaxHeight: Math.min(
			availableHeight * maxHeightRatio,
			Math.max(availableHeight - CARD_VERTICAL_MARGIN, 0)
		)
	}
}
