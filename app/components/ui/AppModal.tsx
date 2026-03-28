import {
	type FC,
	type PropsWithChildren,
	useEffect,
	useRef
} from 'react'
import {
	Modal as NativeModal,
	Platform,
	type ModalProps,
	type ViewProps
} from 'react-native'

import { useAppModalContext } from '@/providers/AppModalProvider'

type AppModalProps = PropsWithChildren<
	ModalProps & {
		wrapperProps?: ViewProps
	}
>

let modalId = 0

const AppModal: FC<AppModalProps> = ({
	children,
	visible,
	onRequestClose,
	wrapperProps,
	...props
}) => {
	const { upsertEntry, removeEntry } = useAppModalContext()
	const idRef = useRef(`app-modal-${modalId++}`)

	useEffect(() => {
		if (Platform.OS !== 'android') return

		if (!visible) {
			removeEntry(idRef.current)
			return
		}

		upsertEntry({
			id: idRef.current,
			node: children,
			onRequestClose,
			wrapperProps
		})

		return () => {
			removeEntry(idRef.current)
		}
	}, [
		children,
		onRequestClose,
		removeEntry,
		upsertEntry,
		visible,
		wrapperProps
	])

	if (Platform.OS === 'android') return null

	return (
		<NativeModal visible={visible} onRequestClose={onRequestClose} {...props}>
			{children}
		</NativeModal>
	)
}

export default AppModal
