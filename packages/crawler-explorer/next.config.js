module.exports = {
	env: {
		ETH_NETWORK: process.env.ETH_NETWORK ?? 'mainnet',
		SERVER_URL: process.env.SERVER_URL ?? 'http://localhost:3000',
		// these keys are public, need to secure on the dashboard
		// https://app.infura.io/dashboard/
		// https://dashboard.alchemy.com/
		INFURA_API_KEY: process.env.INFURA_API_KEY,
		ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
	},
	reactStrictMode: true,
	transpilePackages: [
		'@avante/crawler-api',
		'@avante/crawler-data',
	]
}
