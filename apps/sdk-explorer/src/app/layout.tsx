import type { Metadata, Viewport } from 'next';
import '../../styles/main.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Crawler SDK Explorer',
  description: 'Endless Crawler SDK Explorer',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: wallet/browser extensions may inject body
          attributes before hydration; suppresses only this element's own diff. */}
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
