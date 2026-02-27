import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Camping Gear Inventory',
  description: 'Manage and loan camping gear with friends.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
