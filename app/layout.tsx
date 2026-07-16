import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CDI Finder — Agent de candidature",
  description:
    "Colle une offre, récupère un CV adapté (ATS) et une lettre de motivation, et suis tes candidatures.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
