'use client'

import { ApolloProvider } from '@apollo/client'
import { type PropsWithChildren } from 'react'

import { client } from '../libs/apollo-client'

export function ApolloClientProvider({ children }: PropsWithChildren) {
	return <ApolloProvider client={client}>{children}</ApolloProvider>
}
