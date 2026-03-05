import { haveItemsChangedById } from './have-items-changedById'

describe('haveItemsChangedById', () => {
	it('should return true if previous is undefined and current has items', () => {
		expect(haveItemsChangedById(undefined, [{ id: '1' }])).toBe(true)
	})

	it('should return false if previous is undefined and current is empty', () => {
		expect(haveItemsChangedById(undefined, [])).toBe(false)
	})

	it('should return false if both arrays have the same ids', () => {
		const prev = [{ id: '1' }, { id: '2' }]
		const curr = [{ id: '1' }, { id: '2' }]
		expect(haveItemsChangedById(prev, curr)).toBe(false)
	})

	it('should return true if lengths differ', () => {
		const prev = [{ id: '1' }]
		const curr = [{ id: '1' }, { id: '2' }]
		expect(haveItemsChangedById(prev, curr)).toBe(true)
	})

	it('should return true if ids differ with same length', () => {
		const prev = [{ id: '1' }, { id: '2' }]
		const curr = [{ id: '1' }, { id: '3' }]
		expect(haveItemsChangedById(prev, curr)).toBe(true)
	})

	it('should return false for two empty arrays', () => {
		expect(haveItemsChangedById([], [])).toBe(false)
	})

	it('should work regardless of order (Set-based comparison)', () => {
		const prev = [{ id: '1' }, { id: '2' }]
		const curr = [{ id: '2' }, { id: '1' }]
		expect(haveItemsChangedById(prev, curr)).toBe(false)
	})

	it('should ignore non-id properties', () => {
		const prev = [{ id: '1', name: 'Alice' }]
		const curr = [{ id: '1', name: 'Bob' }]
		expect(haveItemsChangedById(prev, curr)).toBe(false)
	})
})
