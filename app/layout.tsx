import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Navbar from "@/components/navbar"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "CarIntel AI - Car Price Intelligence",
  description:
    "AI-powered car price analysis, market trends, and decision intelligence for smarter vehicle purchases.",
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Navbar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  )
}
