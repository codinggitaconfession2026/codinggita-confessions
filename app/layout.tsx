import './globals.css';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'CodingGita Community',
  description: 'A private student community for CodingGita.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <div className="footer-inner">
            <div><strong>CG Community</strong><span>Built for students • Privacy first</span></div>
            <div className="footer-links"><a href="/privacy">Privacy</a><a href="/guidelines">Guidelines</a><a href="/terms">Terms</a></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
