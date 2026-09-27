import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/app/components/theme-toggle";
import styles from "./polygon.module.css";

export const metadata: Metadata = { title: "Полигон шрифтов — Eschatia" };

const fonts = ["Courier New"]
  .flatMap((family) => [400, 700].map((weight) => ({ family, weight })));
const phrase = "Ровно 1249 лет назад мир содрогнулся от катастрофы, вошедшей в хроники как Астериоклизм";

export default function PolygonPage() {
  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/">← На главную</Link>
      <div className="polygon-theme"><ThemeToggle /></div>
      <h1>Полигон</h1>
      <p className={styles.note}>Моноширинные шрифты, 15 пт: обычное и жирное начертание. Доступность зависит от устройства; отсутствующий шрифт заменяется системным моноширинным.</p>
      {fonts.map((font) => (
        <p className={styles.sample} key={`${font.family}-${font.weight}`} style={{ fontFamily: `"${font.family}", monospace`, fontWeight: font.weight }}>
          {phrase} — {font.family}, {font.weight === 700 ? "жирный" : "обычный"}
        </p>
      ))}
    </main>
  );
}
