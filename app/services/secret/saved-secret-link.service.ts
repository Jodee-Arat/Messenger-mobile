import AsyncStorage from '@react-native-async-storage/async-storage'

const SAVED_SECRET_LINKED_WEB_SESSION_ID_KEY =
	'mesarat:saved-secret-linked-web-session-id'

export const saveSavedSecretLinkedWebSessionId = async (
	secretSessionId: string
) => {
	await AsyncStorage.setItem(
		SAVED_SECRET_LINKED_WEB_SESSION_ID_KEY,
		secretSessionId
	)
}

export const loadSavedSecretLinkedWebSessionId = async () =>
	AsyncStorage.getItem(SAVED_SECRET_LINKED_WEB_SESSION_ID_KEY)

export const clearSavedSecretLinkedWebSessionId = async () => {
	await AsyncStorage.removeItem(SAVED_SECRET_LINKED_WEB_SESSION_ID_KEY)
}
