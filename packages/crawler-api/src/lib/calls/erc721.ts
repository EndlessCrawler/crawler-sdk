import {
	Options,
	ContractName,
	Address,
} from '@avante/crawler-data'
import {
	readContractOrThrow,
} from '../wagmi'


//---------------------
// ERC721
// https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#IERC721
//

/** @returns execute 'balanceOf(owner)' on ERC721 contract **/
export const readBalanceOf = async (owner: Address, contractName: ContractName, options: Options = {}): Promise<number> => {
	const readContractOptions = {
		...options,
		contractName,
		functionName: 'balanceOf',
		args: [owner],
	}
	const result = await readContractOrThrow(readContractOptions)
	return Number(result)
}

/** @returns execute 'ownerOf(tokenId)' on ERC721 contract **/
export const readOwnerOf = async (tokenId: number | BigInt, contractName: ContractName, options: Options = {}): Promise<Address> => {
	const readContractOptions = {
		...options,
		contractName,
		functionName: 'ownerOf',
		args: [tokenId],
	}
	const result = await readContractOrThrow(readContractOptions)
	return result as Address
}


//---------------------
// ERC721Enumerable
// https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721Enumerable
//

/** @returns execute 'totalSupply()' on ERC721Enumerable contract **/
export const readTotalSupply = async (contractName: ContractName, options: Options = {}): Promise<number> => {
	const readContractOptions = {
		...options,
		contractName,
		functionName: 'totalSupply',
		args: [],
	}
	const result = await readContractOrThrow(readContractOptions)
	return Number(result)
}
