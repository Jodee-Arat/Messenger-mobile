import { CodegenConfig } from '@graphql-codegen/cli'
import 'dotenv/config'

const config: CodegenConfig = {
	schema:
		process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:4000/graphql',
	documents: ['./app/graphql/**/*.graphql'],
	generates: {
		'./app/graphql/generated/output.ts': {
			plugins: [
				'typescript',
				'typescript-operations',
				'typescript-react-apollo'
			]
		}
	},
	ignoreNoDocuments: true
}

export default config
