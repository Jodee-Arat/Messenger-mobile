import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 1500) {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => clearTimeout(timeout)
	}, [delay, value])

	return debouncedValue
}
