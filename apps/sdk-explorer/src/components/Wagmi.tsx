import React, { ReactNode } from 'react'
import { WagmiConfig, createConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

const config = createConfig(
	getDefaultConfig({
		// Required API Keys
		alchemyId: process.env.ALCHEMY_API_KEY,
		// infuraId: process.env.INFURA_API_KEY,
		walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID ?? '',
		// Required
		appName: 'Crawler SDK Explorer',
		// Optional
		appDescription: 'Endless Crawler SDK',
		appUrl: 'https://endlesscrawler.io',
		appIcon: '/door_incircle.png',
	}),
)

const _customTheme = {
	"--ck-font-family": '"Noto Sans Mono", monospace',
	"--ck-border-radius": '2px',
}

const Wagmi = ({ children }: React.PropsWithChildren) => {
	return (
		<WagmiConfig config={config}>
			<ConnectKitProvider mode='dark' customTheme={_customTheme}>
				{children}
			</ConnectKitProvider>
		</WagmiConfig>
	)
}

export default Wagmi
