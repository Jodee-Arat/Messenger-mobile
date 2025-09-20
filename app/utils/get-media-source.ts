import { MEDIA_URL } from '../libs/constants/url.constant'

export function getMediaSource(path: string | undefined | null) {
	if (!path) return ''
	const cacheBuster = `?v=${Date.now()}`
	return MEDIA_URL + path + cacheBuster
}
