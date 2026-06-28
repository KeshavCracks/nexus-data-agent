import './globals.css'
import type { Metadata } from 'next'
import { Rajdhani, Geist, JetBrains_Mono } from 'next/font/google'

const rajdhani = Rajdhani({ 
  subsets: ['latin'], 
  weight: ['500', '700'], 
  variable: '--font-rajdhani' 
})

const geist = Geist({ 
  subsets: ['latin'], 
  variable: '--font-geist' 
})

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
})

export const metadata: Metadata = {
  title: 'Nexus Intelligence HUD',
  description: 'Tactical Data Analysis Agent',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${rajdhani.variable} ${jetbrains.variable} bg-black text-white`}>
        {children}
      </body>
    </html>
  )
}
