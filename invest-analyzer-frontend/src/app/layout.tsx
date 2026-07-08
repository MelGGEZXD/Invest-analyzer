import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "InvestAnalyzer",
  description: "Financial simulation modeling dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/*  AppProvider  */}
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}