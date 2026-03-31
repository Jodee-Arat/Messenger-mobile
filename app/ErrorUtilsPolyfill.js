// ErrorUtilsPolyfill.ts
if (typeof global.ErrorUtils === 'undefined') {
	const fallback = {
		setGlobalHandler: _handler => {},
		getGlobalHandler: () => (_error, _isFatal) => {}
	}

	try {
		global.ErrorUtils = fallback
	} catch {
		try {
			Object.defineProperty(global, 'ErrorUtils', {
				value: fallback,
				configurable: true,
				writable: true
			})
		} catch {
			// Ignore if runtime owns this property
		}
	}
}
