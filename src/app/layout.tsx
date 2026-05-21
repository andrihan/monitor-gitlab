import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "GitLab Monitor", template: "%s · GitLab Monitor" },
  description: "Tableau de bord de monitoring GitLab",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`h-full ${inter.variable}`}>
      <body className="h-full flex antialiased" style={{ background: "#F5F3FF" }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="px-8 py-8 max-w-[1440px] mx-auto animate-fade-up">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
