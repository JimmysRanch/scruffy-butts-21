import type { Metadata } from 'next';
import './globals.css';
import '@/styles/theme.css';
import '@/index.css';
import { ClientRoot } from './client-root';

export const metadata: Metadata = {
  title: 'Scruffy Butts - Pet Grooming Management',
  description: 'Pet grooming management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
