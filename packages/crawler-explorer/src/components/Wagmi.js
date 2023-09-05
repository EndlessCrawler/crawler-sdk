import React from 'react'
import { WagmiConfig, createConfig } from 'wagmi'
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit'

const config = createConfig(
	getDefaultConfig({
		// Required API Keys
		alchemyId: process.env.ALCHEMY_API_KEY, // or infuraId
		// infuraId: process.env.INFURA_API_KEY, // or infuraId
		walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID,
		// Required
		appName: 'Crawler SDK Explorer',
		// Optional
		appDescription: 'Endless Crawler SDK',
		appUrl: 'https://endlesscrawler.io',
		appIcon: '/door_incircle.png',
	}),
)

const Wagmi = ({children}) => {
	return (
		<WagmiConfig config={config}>
			<ConnectKitProvider>
				<ConnectKitButton />
				{children}
			</ConnectKitProvider>
		</WagmiConfig>
	)
}

export default Wagmi
