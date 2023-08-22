// https://prettier.io/docs/en/api
// https://prettier.io/docs/en/browser.html
import * as prettier from 'prettier/standalone.mjs'
import prettierPluginBabel from 'prettier/plugins/babel.mjs'
import prettierPluginEstree from 'prettier/plugins/estree.mjs'
import { isString, isObject } from '@avante/crawler-data'

export const formatViewData = async (data = {}) => {
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

