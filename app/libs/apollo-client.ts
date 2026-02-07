// src/lib/apollo-client.ts
import {
	ApolloClient,
	ApolloLink,
	InMemoryCache,
	Observable,
	Operation,
	gql,
	split
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createUploadLink } from 'apollo-upload-client'
import * as SecureStore from 'expo-secure-store'
import { jwtDecode } from 'jwt-decode'

import {
	EnumAsyncStorage,
	EnumSecureStore
} from '@/types/interface/auth.interface'

import { handleLogout } from '@/services/auth/auth.service'

import { SERVER_URL, WEBSOCKET_URL } from './constants/url.constant'

/** PUBLIC operations that don't require auth */
const PUBLIC_OPERATIONS = new Set(['LoginUser', 'CreateUserWEmail'])

/**
 * Refresh concurrency guard:
 * если уже идёт refresh — повторные вызовы ждут результат одного refresh'а.
 */
let refreshPromise: Promise<string | null> | null = null

async function doRefresh(refreshToken: string): Promise<string | null> {
	const res = await fetch(SERVER_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `mutation Refresh($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken)
      }`,
			variables: { refreshToken }
		})
	})

	if (!res.ok) return null
	const json = await res.json()
	const newToken = json?.data?.refreshToken ?? null
	return newToken
}

/**
 * Получить access token. Если просрочен — попытаться рефрешнуть.
 * Реализована защита от параллельных refresh'ей (refreshPromise).
 * В случае провала — вызвать handleLogout() и вернуть null.
 */
export async function getAccessToken(): Promise<string | null> {
	try {
		const token = await AsyncStorage.getItem(EnumAsyncStorage.ACCESS_TOKEN)
		if (!token) return null

		let decoded: any = null
		try {
			decoded = jwtDecode(token)
		} catch {
			// Невалидный JWT — удаляем
			await AsyncStorage.removeItem(EnumAsyncStorage.ACCESS_TOKEN)
			return null
		}

		const now = Date.now() / 1000
		// считаем токен валидным, если exp > now + 5s
		if (decoded?.exp && decoded.exp > now + 5) {
			return token
		}

		// token expired -> try refresh. Если уже идёт refresh, ждём.
		if (refreshPromise) {
			return await refreshPromise
		}

		const refreshToken = await SecureStore.getItemAsync(
			EnumSecureStore.REFRESH_TOKEN
		)
		if (!refreshToken) {
			await handleLogout()
			return null
		}

		refreshPromise = (async () => {
			try {
				const newToken = await doRefresh(refreshToken)
				if (!newToken) {
					await handleLogout()
					return null
				}
				await AsyncStorage.setItem(
					EnumAsyncStorage.ACCESS_TOKEN,
					newToken
				)
				return newToken
			} catch (e) {
				await handleLogout()
				return null
			} finally {
				refreshPromise = null
			}
		})()

		return await refreshPromise
	} catch (e) {
		await handleLogout()
		return null
	}
}

/* ---------------------------
   WEB SOCKET: динамический link
   --------------------------- */

let currentWsLink: ApolloLink | null = null

function createWsLink(): ApolloLink {
	return new WebSocketLink({
		uri: WEBSOCKET_URL,
		options: {
			reconnect: true,
			lazy: true,
			connectionParams: async () => {
				const token = await getAccessToken()
				return {
					authToken: token ? `Bearer ${token}` : null
				}
			}
		}
	})
}

// Инициализация
currentWsLink = createWsLink()

const dynamicWsLink = new ApolloLink((operation, forward) => {
	if (!currentWsLink) {
		currentWsLink = createWsLink()
	}
	// @ts-ignore — у WebSocketLink есть request
	return (currentWsLink as any).request(operation, forward)
})

/** Пересоздать ws-link (вызвать после обновления токена) */
export function rebuildWebsocketLink() {
	try {
		// стараемся аккуратно закрыть старое соединение, если subscriptionClient доступен
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const anyLink: any = currentWsLink
		if (anyLink && anyLink.subscriptionClient) {
			try {
				anyLink.subscriptionClient.close(false, false)
			} catch (e) {
				// ignore
			}
		}
	} finally {
		currentWsLink = createWsLink()
	}
}

/* ---------------------------
   authLink: добавляет Authorization в заголовки
   --------------------------- */

const authLink = new ApolloLink((operation: Operation, forward) => {
	return new Observable(observer => {
		;(async () => {
			try {
				const opName = operation.operationName ?? ''
				if (PUBLIC_OPERATIONS.has(opName)) {
					const sub = forward(operation).subscribe(observer)
					return () => sub.unsubscribe()
				}

				const token = await getAccessToken()
				if (!token) {
					// нет токена — выходим
					await handleLogout()
					return
				}

				operation.setContext(
					({ headers = {} }: { headers?: Record<string, any> }) => ({
						headers: {
							...headers,
							authorization: `Bearer ${token}`
						}
					})
				)

				const sub = forward(operation).subscribe({
					next: value => observer.next(value),
					error: err => observer.error(err),
					complete: () => observer.complete()
				})

				return () => sub.unsubscribe()
			} catch (err) {
				observer.error(err)
			}
		})()
	})
})

/* ---------------------------
   HTTP upload link
   --------------------------- */

const httpLink = createUploadLink({
	uri: SERVER_URL,
	credentials: 'include',
	headers: {
		'apollo-require-preflight': 'true'
	}
}) as unknown as ApolloLink

/* ---------------------------
   split (subscriptions vs http)
   --------------------------- */

const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query)
		return (
			definition.kind === 'OperationDefinition' &&
			definition.operation === 'subscription'
		)
	},
	dynamicWsLink,
	ApolloLink.from([authLink, httpLink])
)

/* ---------------------------
   errorLink: на 401 — пробуем рефреш и повтор запроса, иначе logout
   --------------------------- */

const errorLink = onError(({ networkError, operation, forward }) => {
	const status =
		(networkError as any)?.statusCode ??
		(networkError as any)?.status ??
		(networkError as any)?.statusCode

	if (status === 401) {
		// пробуем обновить токен и повторить операцию
		return new Observable(observer => {
			;(async () => {
				try {
					const newToken = await getAccessToken()
					if (!newToken) {
						// рефреш не сработал
						await handleLogout()
						observer.error(new Error('Unauthorized'))
						return
					}

					// пересоздаём WS, чтобы подписки использовали новый токен
					rebuildWebsocketLink()

					// повторяем исходный запрос с новым токеном
					operation.setContext(
						({
							headers = {}
						}: {
							headers?: Record<string, any>
						}) => ({
							headers: {
								...headers,
								authorization: `Bearer ${newToken}`
							}
						})
					)

					const sub = forward(operation).subscribe({
						next: res => observer.next(res),
						error: err => observer.error(err),
						complete: () => observer.complete()
					})

					return () => sub.unsubscribe()
				} catch (e) {
					await handleLogout()
					observer.error(e)
				}
			})()
		})
	}
})

/* ---------------------------
   Создаём Apollo Client
   --------------------------- */

export const client = new ApolloClient({
	link: ApolloLink.from([errorLink, splitLink]),
	cache: new InMemoryCache()
})

/* ---------------------------
   Простой ME-запрос, который можно использовать в AuthProvider
   --------------------------- */
export const ME_QUERY = gql`
	query Me {
		me {
			id
		}
	}
`
