import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { Nav }         from '@/components/Nav';
import { StickyBar }   from '@/components/StickyBar';
import { WhatsApp }    from '@/components/WhatsApp';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SELVERINE — Rituel Capillaire Premium',
  description: 'Nourrit votre cuir chevelu en profondeur. Non gras. Formulé en laboratoire. Livraison 24-48h au Maroc. Paiement à la livraison.',
  openGraph: {
    title: 'SELVERINE — Rituel Capillaire Premium',
    description: 'Non gras. Formulé en laboratoire. Livraison 24-48h au Maroc.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <Nav />
          <main>{children}</main>
          <StickyBar />
          <WhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}
