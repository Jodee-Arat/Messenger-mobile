import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { SettingsStore } from './settings.type'

export const settingsStore = create(
	persist<SettingsStore>(
		set => ({
			theme: 'dark',
			language: 'ru',
			setTheme: theme => set({ theme }),
			toggleTheme: () =>
				set(state => ({
					theme: state.theme === 'dark' ? 'light' : 'dark'
				})),
			setLanguage: language => set({ language }),
			toggleLanguage: () =>
				set(state => ({
					language: state.language === 'ru' ? 'en' : 'ru'
				}))
		}),
		{
			name: 'settings',
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
)
