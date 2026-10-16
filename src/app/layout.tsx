import type { Metadata } from 'next';
import { Google_Sans } from 'next/font/google';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '@/theme';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/cart/CartDrawer';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

const googleSans = Google_Sans({
  subsets: ['latin'],
  variable: '--font-google-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aurora Concept Store | E-Commerce Multi-Tenant',
  description: 'Tienda e-commerce multi-tenant desarrollada con Next.js, Mantine, Firebase y Mercado Pago.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={googleSans.variable} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body className={googleSans.className}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications position="top-right" />
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <CartDrawer />
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
