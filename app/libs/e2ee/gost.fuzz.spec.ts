import fc from 'fast-check'

import { fromHex, toHex } from './gost'

describe('mobile E2EE hex parsing fuzzing', () => {
	it('round-trips arbitrary byte arrays', () => {
		fc.assert(
			fc.property(fc.uint8Array({ maxLength: 128 }), bytes => {
				expect(Array.from(fromHex(toHex(bytes)))).toEqual(Array.from(bytes))
			})
		)
	})

	it('rejects malformed X3DH/pre-key hex material without crashing', () => {
		fc.assert(
			fc.property(fc.string({ maxLength: 128 }), value => {
				const normalized = value.replace(/\s+/g, '').toLowerCase()
				const isValid =
					normalized.length % 2 === 0 && /^[0-9a-f]*$/.test(normalized)

				if (!isValid) {
					expect(() => fromHex(value)).toThrow()
				}
			})
		)
	})
})
