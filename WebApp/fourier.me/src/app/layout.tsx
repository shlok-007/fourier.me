import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/provider'
import { Toaster } from "@/components/ui/toaster"
import './globals.css'

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'fourier.me',
  description: 'Generate Fourier Epicycle Animations from your own images',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
            <main>{children}</main>
            <Toaster />
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
