// RN module shim for 'gostEngine' — export the real engine from gost-crypto
// gostCrypto.js uses global.gostEngine.execute(algorithm, method, args) as fallback
// when Web Worker is unavailable (always the case in React Native).
let engine = null
console.log('[gostEngineRN] ⏳ Загружаю gost-crypto/lib/gostEngine.js...')
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	engine = require('gost-crypto/lib/gostEngine.js')
	console.log(
		'[gostEngineRN] require() OK. typeof:',
		typeof engine,
		'| keys:',
		engine ? Object.keys(engine).join(', ') : 'null'
	)
	console.log('[gostEngineRN] engine.execute:', typeof engine?.execute)
} catch (e) {
	console.error(
		'[gostEngineRN] ❌ Failed to load gost-crypto/lib/gostEngine.js:',
		e?.message || e
	)
}

if (!engine || typeof engine.execute !== 'function') {
	if (engine) {
		console.warn(
			'[gostEngineRN] ⚠️ gostEngine loaded but has no execute() method. Keys:',
			Object.keys(engine)
		)
	} else {
		console.warn('[gostEngineRN] ⚠️ engine is null — экспортирую stub')
	}
	// Provide minimal stub with meaningful error
	module.exports = {
		execute() {
			throw new Error(
				'gost-crypto engine is unavailable. Ensure gost-crypto is installed and Metro restarted with -c'
			)
		}
	}
} else {
	console.log(
		'[gostEngineRN] ✅ Engine OK — экспортирую настоящий gostEngine с execute()'
	)
	module.exports = engine
}
