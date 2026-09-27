import type { Metadata } from "next";
import "./globals.css";
import ArticleNavigation from "./components/article-navigation";

export const metadata: Metadata = {
  title: "Eschatia La Frontier",
  description: "Ролевой мир, где Скверна стала новой магией.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('eschatia-theme')==='dark'?'dark':'light'}catch{}` }} /></head>
      <body>{children}<ArticleNavigation /></body>
    </html>
  );
}
