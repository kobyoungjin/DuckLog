import type { Metadata } from "next";
import { Libre_Caslon_Text, Source_Serif_4, Bricolage_Grotesque } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-caslon",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "DuckLog",
  description: "팬덤/취미 기록 및 실물 책 출판 주문 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${libreCaslon.variable} ${sourceSerif.variable} ${bricolage.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-background text-on-surface font-body-md selection:bg-secondary-container/30">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
