import { isAddress, zeroAddress } from 'viem'

export function isZeroAddress(address) {
	return (address == zeroAddress || (address?.length > 2 && zeroAddress.startsWith(address)))
}

export function validateAddress(address, zeroIsValid = false) {
	if (isZeroAddress(address)) {
		return zeroIsValid
	}
	return isAddress(address)
}

export function isSameAddress(address1, address2, zeroIsValid = false) {
	return validateAddress(address1, zeroIsValid) && address1?.toLowerCase() == address2?.toLowerCase()
}

export function formatAddress(address, short = false) {
	if (!validateAddress(address)) return '0x?'
	let result = address.toUpperCase()
	result = '0x' + (result[1] == 'X' ? result.substring(2) : result)
	if (short)
		result = result.substring(0, 6) + '…' + result.substring(result.length - 4)
	return result
}

export function validateArgs(args = []) {
	const hasNullArgs = args.reduce((result, value) => result || value == null, false)
	return !hasNullArgs
}

export {
	isAddress,
	zeroAddress,
}