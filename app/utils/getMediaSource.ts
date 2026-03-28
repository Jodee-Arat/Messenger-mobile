import { MEDIA_URL } from '@/libs/constants/url.constant'

export const getMediaSource = (path: string) => ({
	uri: MEDIA_URL + path
})
