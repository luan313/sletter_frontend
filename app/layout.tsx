import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sletter",
  description: "Seu gerenciador de coleções",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}