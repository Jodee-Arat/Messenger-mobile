import { convertPrice } from './convertPrice'

describe('convertPrice', () => {
	it('should format whole dollar amounts', () => {
		expect(convertPrice(10)).toBe('$10.00')
	})

	it('should format zero', () => {
		expect(convertPrice(0)).toBe('$0.00')
	})

	it('should format cents', () => {
		expect(convertPrice(9.99)).toBe('$9.99')
	})

	it('should format large amounts with commas', () => {
		expect(convertPrice(1000)).toBe('$1,000.00')
		expect(convertPrice(1000000)).toBe('$1,000,000.00')
	})

	it('should format negative amounts', () => {
		expect(convertPrice(-5)).toBe('-$5.00')
	})
})
