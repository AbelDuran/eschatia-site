import type { Metadata } from "next";
import "./globals.css";
import "./portal.css";
import ArticleNavigation from "./components/article-navigation";
import SiteAudio from "./components/site-audio";
import RelatedPages from "./components/related-pages";

export const metadata: Metadata = {
  title: "ESCHATIA LA FRONTIER",
  metadataBase: new URL(process.env.APP_URL || "https://eschatia-site-5wk1.vercel.app"),
  icons: {icon:"/icon.svg"},
  openGraph: {siteName:"ESCHATIA LA FRONTIER",title:"ESCHATIA LA FRONTIER",description:"Мир Фарельвейта: персонажи, государства и история после Астериоклизма.",locale:"ru_RU",type:"website",images:["/news-1.png"]},
  twitter: {card:"summary_large_image"},
  description: "Ролевой мир, где Скверна стала новой магией.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('eschatia-theme')==='dark'?'dark':'light'}catch{}` }} /></head>
      <body>{children}<RelatedPages /><ArticleNavigation /><SiteAudio /></body>
    </html>
  );
}
