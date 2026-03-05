const mockStorage: Record<string, string> = {}

jest.mock('@react-native-async-storage/async-storage', () => ({
	__esModule: true,
	default: {
		getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
		setItem: jest.fn((key: string, value: string) => {
			mockStorage[key] = value
			return Promise.resolve()
		}),
		removeItem: jest.fn((key: string) => {
			delete mockStorage[key]
			return Promise.resolve()
		}),
		multiGet: jest.fn(() => Promise.resolve([])),
		multiSet: jest.fn(() => Promise.resolve()),
		multiRemove: jest.fn(() => Promise.resolve()),
		getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStorage))),
		clear: jest.fn(() => {
			Object.keys(mockStorage).forEach(k => delete mockStorage[k])
			return Promise.resolve()
		}),
	}
}))

import { settingsStore } from './settings.store'

describe('settingsStore', () => {
	beforeEach(() => {
		const state = settingsStore.getState()
		state.setTheme('dark')
		state.setLanguage('ru')
	})

	it('should have correct default values', () => {
		const state = settingsStore.getState()
		expect(state.theme).toBe('dark')
		expect(state.language).toBe('ru')
	})

	it('should set theme', () => {
		settingsStore.getState().setTheme('light')
		expect(settingsStore.getState().theme).toBe('light')

		settingsStore.getState().setTheme('dark')
		expect(settingsStore.getState().theme).toBe('dark')
	})

	it('should toggle theme from dark to light', () => {
		settingsStore.getState().toggleTheme()
		expect(settingsStore.getState().theme).toBe('light')
	})

	it('should toggle theme from light to dark', () => {
		settingsStore.getState().setTheme('light')
		settingsStore.getState().toggleTheme()
		expect(settingsStore.getState().theme).toBe('dark')
	})

	it('should set language', () => {
		settingsStore.getState().setLanguage('en')
		expect(settingsStore.getState().language).toBe('en')

		settingsStore.getState().setLanguage('ru')
		expect(settingsStore.getState().language).toBe('ru')
	})

	it('should toggle language from ru to en', () => {
		settingsStore.getState().toggleLanguage()
		expect(settingsStore.getState().language).toBe('en')
	})

	it('should toggle language from en to ru', () => {
		settingsStore.getState().setLanguage('en')
		settingsStore.getState().toggleLanguage()
		expect(settingsStore.getState().language).toBe('ru')
	})

	it('should toggle theme twice back to original', () => {
		settingsStore.getState().toggleTheme()
		settingsStore.getState().toggleTheme()
		expect(settingsStore.getState().theme).toBe('dark')
	})

	it('should toggle language twice back to original', () => {
		settingsStore.getState().toggleLanguage()
		settingsStore.getState().toggleLanguage()
		expect(settingsStore.getState().language).toBe('ru')
	})
})
