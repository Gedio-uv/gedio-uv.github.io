import type { Metadata } from "next";
import { ExamProvider } from "./context/ExamContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zertifikat Deutsch B2 - Simulator",
  description: "TELC B2 Deutschprüfung Simulator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <ExamProvider>
          <main className="main-content">
            {children}
          </main>
        </ExamProvider>
      </body>
    </html>
  );
}
