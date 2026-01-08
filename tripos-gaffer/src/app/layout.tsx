import TopNav from '@/components/TopNav';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tripos Gaffer',
  description: 'Ohhh michael van gerwen!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Persistent app shell */}
        <TopNav />

        {/* Page content */}
        <main className="px-6 py-4">{children}</main>
      </body>
    </html>
  );
}
