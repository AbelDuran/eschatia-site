import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eschatia La Frontier",
  description: "Ролевой мир, где Скверна стала новой магией.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
