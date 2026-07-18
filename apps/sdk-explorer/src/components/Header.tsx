'use client';

import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const pages = [
  { label: 'worlds', href: '/' }, // the browse home; /world/* pages hang below it
  { label: 'data', href: '/data' },
  { label: 'apis', href: '/apis' },
];

const isActive = (href: string, pathname: string): boolean =>
  href === '/' ? pathname === '/' || pathname.startsWith('/world') : pathname.startsWith(href);

export default function Header() {
  const pathname = usePathname() ?? '';

  return (
    <div className="header">
      <div className="flex items-center gap-3">
        <Link href="/">
          <img src="/door.png" className="logo" alt="Endless Crawler" />
        </Link>
        <h2 className="text-ec-bold">CRAWLER SDK EXPLORER</h2>
      </div>

      <div className="mt-1">
        {'· '}
        {pages.map(({ label, href }) => (
          <span key={href}>
            <Link className="anchor" href={href}>
              {isActive(href, pathname) ? <b>{label}</b> : label}
            </Link>
            {' · '}
          </span>
        ))}
      </div>

      <div className={cn('connect-corner')}>
        <ConnectKitButton />
      </div>
    </div>
  );
}
