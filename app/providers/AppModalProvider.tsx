import {
	createContext,
	type FC,
	type PropsWithChildren,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react'
import {
	BackHandler,
	type ModalProps,
	Platform,
	StyleSheet,
	View,
	type ViewProps
} from 'react-native'

type ModalEntry = {
	id: string
	node: ReactNode
	onRequestClose?: ModalProps['onRequestClose']
	wrapperProps?: ViewProps
}

type AppModalContextValue = {
	upsertEntry: (entry: ModalEntry) => void
	removeEntry: (id: string) => void
}

const AppModalContext = createContext<AppModalContextValue | null>(null)

export const AppModalProvider: FC<PropsWithChildren> = ({ children }) => {
	const [entries, setEntries] = useState<ModalEntry[]>([])

	useEffect(() => {
		if (Platform.OS !== 'android') return

		const subscription = BackHandler.addEventListener(
			'hardwareBackPress',
			() => {
				const topEntry = entries[entries.length - 1]
				if (!topEntry) return false

				topEntry.onRequestClose?.({} as never)
				return true
			}
		)

		return () => subscription.remove()
	}, [entries])

	const value = useMemo<AppModalContextValue>(
		() => ({
			upsertEntry: entry => {
				setEntries(prev => {
					const index = prev.findIndex(item => item.id === entry.id)
					if (index === -1) return [...prev, entry]

					const next = [...prev]
					next[index] = entry
					return next
				})
			},
			removeEntry: id => {
				setEntries(prev => prev.filter(entry => entry.id !== id))
			}
		}),
		[]
	)

	return (
		<AppModalContext.Provider value={value}>
			{children}
			{Platform.OS === 'android' && entries.length > 0 && (
				<View
					pointerEvents='box-none'
					style={StyleSheet.absoluteFill}
				>
					{entries.map(entry => (
						<View
							key={entry.id}
							pointerEvents='box-none'
							style={StyleSheet.absoluteFill}
							{...entry.wrapperProps}
						>
							{entry.node}
						</View>
					))}
				</View>
			)}
		</AppModalContext.Provider>
	)
}

export const useAppModalContext = () => {
	const context = useContext(AppModalContext)

	if (!context) {
		throw new Error(
			'useAppModalContext must be used within AppModalProvider'
		)
	}

	return context
}
