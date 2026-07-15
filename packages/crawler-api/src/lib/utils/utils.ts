import { isAddress, zeroAddress } from 'viem';

export function isZeroAddress(address: string): boolean {
  return address === zeroAddress || (address?.length > 2 && zeroAddress.startsWith(address));
}

export function validateAddress(address: string, zeroIsValid: boolean = false): boolean {
  if (isZeroAddress(address)) {
    return zeroIsValid;
  }
  return isAddress(address);
}

export function isSameAddress(
  address1: string,
  address2: string,
  zeroIsValid: boolean = false,
): boolean {
  return (
    validateAddress(address1, zeroIsValid) && address1?.toLowerCase() === address2?.toLowerCase()
  );
}

export function formatAddress(address: string, short: false = false): string {
  if (!validateAddress(address)) return '0x?';
  let result = address.toUpperCase();
  result = '0x' + (result[1] === 'X' ? result.substring(2) : result);
  if (short) result = result.substring(0, 6) + '…' + result.substring(result.length - 4);
  return result;
}

export function validateArgs(args: any[] = []): boolean {
  for (let i = 0; i < args.length; ++i) {
    if (args[i] == null) {
      return false;
    }
    if (Array.isArray(args[i])) {
      if (!validateArgs(args[i])) return false;
    }
  }
  return true;
}

export { zeroAddress };
