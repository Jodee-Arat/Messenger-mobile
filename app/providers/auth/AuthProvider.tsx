// src/providers/AuthProvider.tsx
import * as SplashScreen from 'expo-splash-screen'
import React, {
	FC,
	PropsWithChildren,
	createContext,
	useEffect,
	useRef
} from 'react'
import { AppState, AppStateStatus } from 'react-native'

import {
	getAccessToken,
	getUserIdFromStorage
} from '@/services/auth/auth.helper'
import { handleLogout } from '@/services/auth/auth.service'

import { userStore } from '@/store/user/user.store'

import { ME_QUERY, client, rebuildWebsocketLink } from '@/libs/apollo-client'

type IContext = {
	// если у тебя нужны дополнительные функции, дополни
	checkAuth: () => Promise<boolean>
}

export const AuthContext = createContext<IContext>({
	checkAuth: async () => false
})

// не даём сплэшу скрыться, пока не проверим токен
let _prevented = false
try {
	// preventAutoHideAsync returns a Promise, но мы просто вызываем
	SplashScreen.preventAutoHideAsync()
	_prevented = true
} catch (e) {
	// ignore — если уже был prevent
	_prevented = false
}

const AuthProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
	const { setUserId } = userStore()
	const appState = useRef<AppStateStatus | null>(null)

	// Проверка токена и (опционально) валидация у сервера
	const checkAuth = async (): Promise<boolean> => {
		try {
			// 1) локальный access token (и автоматический refresh внутри getAccessToken)
			const token = await getAccessToken()

			if (!token) {
				return false
			}

			// 2) пробуем запросить минимальную информацию о текущем пользователе — это валидирует токен на сервере
			try {
				const res = await client.query({
					query: ME_QUERY,
					fetchPolicy: 'network-only' // обязательно сетевой запрос, чтобы сервер проверил токен
				})

				const meId = (res?.data as any)?.me?.id

				if (meId) {
					setUserId(meId)
					// пересоздаём WS на всякий случай (если токен был refresh'нут внутри getAccessToken)
					try {
						rebuildWebsocketLink()
					} catch (e) {
						// ignore
					}
					return true
				} else {
					// если сервер вернул пустого me — принудительный логаут

					await handleLogout()
					setUserId('')
					return false
				}
			} catch (e) {
				// Если сетевой запрос упал (напр. 401) — логинимся

				await handleLogout()
				setUserId('')
				return false
			}
		} catch (e) {
			// безопасно логаутим по умолчанию

			await handleLogout()
			setUserId('')
			return false
		}
	}

	useEffect(() => {
		let mounted = true

		const init = async () => {
			try {
				// попытаемся восстановить id пользователя из локального хранилища как fallback
				const storedId = await getUserIdFromStorage()
				if (mounted && storedId) {
					setUserId(storedId)
				}

				// полноценная проверка токена и валидация у сервера

				await checkAuth()
			} finally {
				// прячем сплэш только после завершения проверки
				if (_prevented) {
					try {
						await SplashScreen.hideAsync()
					} catch {
						//
					}
				}
			}
		}

		init()

		return () => {
			mounted = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// При возвращении приложения из фонового режима — проверяем снова.
	useEffect(() => {
		const onAppStateChange = async (next: AppStateStatus) => {
			if (
				appState.current === 'active' &&
				next.match(/inactive|background/)
			) {
				// left active
			}
			if (next === 'active') {
				// вернулись в foreground — перепроверяем
				await checkAuth()
			}
			appState.current = next
		}

		const sub = AppState.addEventListener('change', onAppStateChange)
		return () => sub.remove()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<AuthContext.Provider value={{ checkAuth }}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthProvider
