import { userStore } from '@/store/user/user.store'

export const useUser = () => {
	const userId = userStore(state => state.userId)
	const setUserId = userStore(state => state.setUserId)

	return {
		userId,
		setUserId
	}
}
