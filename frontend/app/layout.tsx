import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IdleBite | Kitchen Optimization OS',
  description: 'Real-time kitchen vision meets dynamic pricing. Optimize restaurant revenue with intelligent capacity-based pricing.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
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
