// RN module shim for 'gostEngine' — export the real engine from gost-crypto
let engine = null
try {
	// Prefer direct engine from the package
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	engine = require('gost-crypto/lib/gostEngine.js')
} catch (e) {
	// leave null
}

if (!engine) {
	// Provide minimal stub with meaningful error
	module.exports = {
		execute() {
			throw new Error(
				'gost-crypto engine is unavailable. Ensure gost-crypto is installed and Metro restarted with -c'
			)
		}
	}
} else {
	module.exports = engine
}
