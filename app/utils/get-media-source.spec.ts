import { getMediaSource } from './get-media-source'

jest.mock('../libs/constants/url.constant', () => ({
	MEDIA_URL: 'https://cdn.example.com'
}))

describe('getMediaSource', () => {
	beforeEach(() => {
		jest.spyOn(Date, 'now').mockReturnValue(1700000000000)
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('should return empty string for null', () => {
		expect(getMediaSource(null)).toBe('')
	})

	it('should return empty string for undefined', () => {
		expect(getMediaSource(undefined)).toBe('')
	})

	it('should return empty string for empty string', () => {
		expect(getMediaSource('')).toBe('')
	})

	it('should construct URL with MEDIA_URL + path + cache buster', () => {
		expect(getMediaSource('/images/avatar.png')).toBe(
			'https://cdn.example.com/images/avatar.png?v=1700000000000'
		)
	})

	it('should handle path without leading slash', () => {
		expect(getMediaSource('uploads/file.jpg')).toBe(
			'https://cdn.example.comuploads/file.jpg?v=1700000000000'
		)
	})
})
