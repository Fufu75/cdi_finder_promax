import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fr">
      <body className="font-sans">{children}</body>
    </html>
  );
}
