'use client';

import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const pages = ['data', 'apis'];

export default function Header() {
  const pathname = usePathname();
  const currentSlug = pathname?.slice(1) ?? '';

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
        {pages.map((slug) => (
          <span key={slug}>
            <Link className="anchor" href={`/${slug}`}>
              {currentSlug === slug ? <b>{slug}</b> : slug}
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
