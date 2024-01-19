// https://prettier.io/docs/en/api
// https://prettier.io/docs/en/browser.html
//@ts-ignore
import * as prettier from 'prettier/standalone.mjs'
//@ts-ignore
import prettierPluginBabel from 'prettier/plugins/babel.mjs'
//@ts-ignore
import prettierPluginEstree from 'prettier/plugins/estree.mjs'
import { isString, isObject } from '@avante/crawler-core'

// javascript version
//@ts-ignore
// BigInt.prototype.toJSON = function () { return this.toString() }
// BigInt.prototype.toJSON = function () { return (this <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(this) : this.toString()) }

// typescript version
(BigInt.prototype as any).toJSON = function () {
	// return this.toString()
	return (this <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(this) : this.toString())
}

export const formatViewData = async (data: any = {}): Promise<string> => {
	if (isString(data)) {
		return data
	} else if (!isObject(data)) {
		return data.toString()
	}
	// return JSON.stringify(data, null, '\t')

	const options = {
		useTabs: true,
		tabWidth: 2,
		printWidth: 80,
		parser: 'json',
		plugins: [prettierPluginBabel, prettierPluginEstree],
	}

	return await prettier.format(JSON.stringify(data), options)
}
