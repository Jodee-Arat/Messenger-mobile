// ErrorUtilsPolyfill.ts
if (typeof global.ErrorUtils === 'undefined') {
	global.ErrorUtils = {
		setGlobalHandler: _handler => {},
		getGlobalHandler: () => (_error, _isFatal) => {}
	}
}
