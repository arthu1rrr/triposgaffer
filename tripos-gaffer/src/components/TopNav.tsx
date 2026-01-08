'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/modules', label: 'Modules' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/settings', label: 'Settings' },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/' || pathname.startsWith('/dashboard');
  return pathname === href || pathname.startsWith(href + '/');
}

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--mutedblack)] bg-[var(--background)]/90 backdrop-blur text-[var(--lightshadow)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="text-base font-semibold tracking-tight">
            Tripos Gaffer
          </Link>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  'transition-colors duration-150',
                  active
                    ? 'text-[var(--text)]'
                    : 'text-[var(--lightshadow)] hover:text-[var(--text)]',
                ].join(' ')}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
