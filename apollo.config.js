require('dotenv/config')

module.exports = {
	client: {
		service: {
			name: 'my-graphql-api',
			url:
				process.env.EXPO_PUBLIC_SERVER_URL ||
				'http://localhost:4000/graphql',
			skipSSLValidation: true
		},
		includes: ['src/**/*.graphql']
	}
}
