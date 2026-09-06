import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/config/siteConfig';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/cookie/CookieConsent';
import { CookieProvider } from '@/components/cookie/CookieConsentContext';
import FooterManagerBridge from '@/components/cookie/FooterManagerBridge';
import SessionProvider from '@/components/auth/SessionProvider';
import StructuredDataGlobal from '@/components/seo/StructuredDataGlobal';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#050705',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'AV-INVEST Research | Formazione finanziaria e analisi tecnica',
    template: '%s - AV-INVEST RESEARCH',
  },
  description: 'Formazione finanziaria, analisi tecnica e gestione del rischio per comprendere i mercati e prendere decisioni più consapevoli.',
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'AV-INVEST Research | Formazione finanziaria e analisi tecnica',
    description: 'Formazione finanziaria, analisi tecnica e gestione del rischio per comprendere i mercati e prendere decisioni più consapevoli.',
    images: [
      {
        url: 'https://avinvestresearch.com/images/av-invest-social-v2.png',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AV-INVEST Research | Formazione finanziaria e analisi tecnica',
    description: 'Formazione finanziaria, analisi tecnica e gestione del rischio per comprendere i mercati e prendere decisioni più consapevoli.',
    images: ['https://avinvestresearch.com/images/av-invest-twitter-v2.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://avinvestresearch.com',
    languages: {
      'it-IT': '/',
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it-IT" className={`${inter.variable} ${display.variable}`}>
      <body className="antialiased">
        <SessionProvider>
          <CookieProvider>
            <a href="#main" className="sr-only-focus">
              Salta al contenuto principale
            </a>
            <Navbar />
            <main id="main" className="relative">
              {children}
            </main>
            <CookieConsent />
            <FooterManagerBridge />
            <StructuredDataGlobal />
            <Footer />
          </CookieProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
