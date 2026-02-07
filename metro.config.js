// Metro config: extend Expo default and add alias for 'gostEngine' used by 'gost-crypto'
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

config.resolver = {
	...config.resolver,
	extraNodeModules: {
		...(config.resolver?.extraNodeModules || {}),
		gostEngine: path.resolve(
			__dirname,
			'app/libs/e2ee/gostEngineRN/index.js'
		)
	}
}

module.exports = config
