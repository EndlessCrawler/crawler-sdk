import 'jest-expect-message'
import {
	zeroAddress,
	isZeroAddress,
	validateAddress,
	isSameAddress,
	formatAddress,
	validateArgs,
} from '../src/lib'

const _address = [
	'0x0000000000000000000000000000000000000000',
	'0xD7137B798B67d5bd55E64c9351C4b82492dc97a4',
	'0x3764dfE9Cf29475512AFECcD5F2959D6b527db4b',
	'0x60fA6cCcf05ad4cBe7D5226E5B1122c0C2962a7d',
]

const _tx = [
	'0xee85136868487c96610a628185e25dde0d687ef11c0d111a57ada88134aaafe8',
	'0xee5d962d28f26ec90381afa1b1e85ee425db2b23cc5edd40e7a0f12526553db2',
	'0xa087c632eb728b1db48341fbfce52716494a23d6a437bc1564f44e30c06cfb1d',
]

const _lowerCase = (value:string) => (value.toLowerCase())
const _upperCase = (value:string) => (`0x${value.slice(2).toLowerCase()}`)

describe('* utils', () => {

	it('zeroAddress()', () => {
		expect(isZeroAddress(zeroAddress)).toBe(true)
		expect(isZeroAddress(_address[0])).toBe(true)
		expect(isSameAddress(_address[0], zeroAddress, true)).toBe(true)
	})

	it('validateAddress()', () => {
		expect(validateAddress(zeroAddress, true)).toBe(true)
		expect(validateAddress(zeroAddress, false)).toBe(false)
		expect(validateAddress('0x0', true)).toBe(true)
		expect(validateAddress('0x0', false)).toBe(false)
		expect(validateAddress('0', true)).toBe(false)
		expect(validateAddress('0', false)).toBe(false)

		for (let i = 0; i < _tx.length; ++i) {
			const tx = _tx[i]
			expect(validateAddress(tx)).toBe(false)
		}

		for (let i = 0; i < _address.length; ++i) {
			const addr = _address[i]
			const isZero = (i == 0)
			expect(validateAddress(addr, true)).toBe(true)
			expect(validateAddress(addr, false)).toBe(!isZero)
			expect(validateAddress(_lowerCase(addr))).toBe(!isZero)
			expect(validateAddress(_upperCase(addr))).toBe(!isZero)
			expect(validateAddress(addr.toUpperCase())).toBe(false) // '0X...'
		}
	})

	it('isSameAddress()', () => {
		for (let i = 0; i < _address.length; ++i) {
			const addr = _address[i]
			const isZero = (i == 0)
			expect(isSameAddress(addr, _lowerCase(addr), true)).toBe(true)
			expect(isSameAddress(addr, _upperCase(addr), false)).toBe(!isZero)
		}
	})

	it('validateArgs()', () => {
		expect(validateArgs([])).toBe(true)
		expect(validateArgs([0])).toBe(true)
		expect(validateArgs([0, 1, 2])).toBe(true)
		expect(validateArgs([zeroAddress])).toBe(true)
		expect(validateArgs([0, zeroAddress])).toBe(true)

		expect(validateArgs([[0]])).toBe(true)
		expect(validateArgs([0, [0]])).toBe(true)
		expect(validateArgs([0, [0, zeroAddress]])).toBe(true)
		expect(validateArgs([0, [0, zeroAddress], 1])).toBe(true)

		expect(validateArgs([null])).toBe(false)
		expect(validateArgs([undefined])).toBe(false)
		expect(validateArgs([0, null])).toBe(false)
		expect(validateArgs([0, undefined])).toBe(false)
		expect(validateArgs([0, 0, 0, 0, null])).toBe(false)
		expect(validateArgs([[undefined]])).toBe(false)
		expect(validateArgs([0, [undefined]])).toBe(false)
		expect(validateArgs([0, [0, undefined]])).toBe(false)
	})

})
