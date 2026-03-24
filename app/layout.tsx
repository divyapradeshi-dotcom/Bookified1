import type { Metadata } from "next";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import {  IBM_Plex_Serif, Mona_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const ibmPlexSerif=IBM_Plex_Serif({
  variable:'--font-ibm-plex-serif',
  subsets:['latin'],
  weight:['400','500','600','700'],
  display:'swap'
})
 const monaSans=Mona_Sans({
variable:'--font-mona-scan',
subsets:['latin'],
display:'swap'

 })

export const metadata: Metadata = {
  title: "Bookified",
  description: "Transform your books into interactive AI conversations. Upload PDFs, and chat with your books using voice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"> 
      <body className={`${ibmPlexSerif.variable} ${monaSans.variable} relative font-sans antialiased`}>
        <ClerkProvider>
          <header className="flex gap-2 p-4">
            <Show when="signed-out">
              <SignInButton>
                <button className="rounded bg-blue-600 px-3 py-1 text-white">Sign in</button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded bg-green-600 px-3 py-1 text-white">Sign up</button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
