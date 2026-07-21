import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { OfflineFormGuard } from "@/components/pwa/OfflineFormGuard";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Family Finance",
  description: "Track family expenses together, see where money goes, and find ways to save.",
};

export const viewport: Viewport = {
  themeColor: "#1c1330",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <OfflineBanner />
        {children}
        <ServiceWorkerRegistration />
        <OfflineFormGuard />
      </body>
    </html>
  );
}
