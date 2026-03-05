import { formatBytes } from './format-bytes'

describe('formatBytes', () => {
	it('should return "0 Bytes" for 0', () => {
		expect(formatBytes(0)).toBe('0 Bytes')
	})

	it('should return "0 Bytes" for NaN', () => {
		expect(formatBytes(NaN)).toBe('0 Bytes')
	})

	it('should format bytes correctly', () => {
		expect(formatBytes(500)).toBe('500 Bytes')
		expect(formatBytes(1)).toBe('1 Bytes')
	})

	it('should format KiB correctly', () => {
		expect(formatBytes(1024)).toBe('1 KiB')
		expect(formatBytes(1536)).toBe('1.5 KiB')
	})

	it('should format MiB correctly', () => {
		expect(formatBytes(1048576)).toBe('1 MiB')
	})

	it('should format GiB correctly', () => {
		expect(formatBytes(1073741824)).toBe('1 GiB')
	})

	it('should format TiB correctly', () => {
		expect(formatBytes(1099511627776)).toBe('1 TiB')
	})

	it('should respect decimals parameter', () => {
		expect(formatBytes(1536, 0)).toBe('2 KiB')
		expect(formatBytes(1536, 1)).toBe('1.5 KiB')
		expect(formatBytes(1536, 3)).toBe('1.5 KiB')
	})

	it('should treat negative decimals as 0', () => {
		expect(formatBytes(1536, -1)).toBe('2 KiB')
	})
})
