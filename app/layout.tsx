import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// One sturdy grotesque for the whole app; the width axis gives condensed card numerals
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Hanabi Digital",
  description: "A companion for playing Hanabi with a real deck: tracks every clue, what each player knows, and the table.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Hanabi Digital',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#131113',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
