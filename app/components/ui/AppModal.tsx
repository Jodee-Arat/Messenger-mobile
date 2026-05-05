import {
	type FC,
	type PropsWithChildren,
	useLayoutEffect,
	useRef
} from 'react'
import { type ModalProps, type ViewProps } from 'react-native'

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
	wrapperProps
}) => {
	const { upsertEntry, removeEntry } = useAppModalContext()
	const idRef = useRef(`app-modal-${modalId++}`)

	useLayoutEffect(() => {
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

	return null
}

export default AppModal
