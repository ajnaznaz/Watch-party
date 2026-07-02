import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MovieDate - Watch Together',
  description: 'Watch movies with friends anywhere in the world. Synchronized playback, video chat, and shared moments.',
  openGraph: {
    title: 'MovieDate - Watch Together',
    description: 'Watch movies with friends anywhere in the world.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MovieDate - Watch Together',
    description: 'Watch movies with friends anywhere in the world.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
