module.exports = {
	env: {
		SERVER_URL: process.env.SERVER_URL ?? 'http://localhost:3000',
		// these keys are public, need to secure on the dashboard
		// https://app.infura.io/dashboard/
		// https://dashboard.alchemy.com/
		INFURA_API_KEY: process.env.INFURA_API_KEY ?? '',
		ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY ?? '',
		WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID ?? '',
	},
	reactStrictMode: true,
	transpilePackages: [
		'@avante/crawler-core',
		'@avante/crawler-data',
		'@avante/crawler-api',
		'@avante/crawler-react',
	],
	webpack: (config) => {
		// walletconnect
		config.resolve.fallback = { fs: false, net: false, tls: false, lokijs: false, encoding: false, 'pino-pretty': false }
		return config
	},
}
