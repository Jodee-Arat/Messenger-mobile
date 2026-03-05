export type ThemeMode = 'dark' | 'light'
export type AppLanguage = 'ru' | 'en'

export interface SettingsStore {
	theme: ThemeMode
	language: AppLanguage
	setTheme: (theme: ThemeMode) => void
	toggleTheme: () => void
	setLanguage: (language: AppLanguage) => void
	toggleLanguage: () => void
}
