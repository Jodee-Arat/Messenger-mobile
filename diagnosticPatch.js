/**
 * ВРЕМЕННЫЙ ДИАГНОСТИЧЕСКИЙ ПАТЧ
 * Перехватывает Object.defineProperty, логирует (и поглощает) ошибки
 * вместо падения "TypeError: property is not configurable"
 *
 * После идентификации проблемного свойства — удалить этот файл и импорт в App.tsx
 */
var _origDefineProperty = Object.defineProperty
Object.defineProperty = function diagnosticDefineProperty(
	obj,
	prop,
	descriptor
) {
	try {
		return _origDefineProperty.call(this, obj, prop, descriptor)
	} catch (e) {
		var propName = typeof prop === 'string' ? prop : String(prop)
		var isGlobal =
			obj === global ||
			obj === globalThis ||
			(typeof window !== 'undefined' && obj === window)
		console.warn(
			'[DIAG defineProperty FAIL]',
			'prop:',
			propName,
			'| isGlobal:',
			isGlobal,
			'| error:',
			e && e.message,
			'\nSTACK:',
			new Error().stack
		)
		// Поглощаем ошибку, чтобы не крашить рантайм
	}
}
