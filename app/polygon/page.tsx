import type { Metadata } from "next";
import Link from "next/link";
import styles from "./polygon.module.css";

export const metadata: Metadata = { title: "Полигон шрифтов — Eschatia" };

const fonts = [
  "Times New Roman", "Georgia", "Palatino Linotype", "Cambria",
  "Arial", "Verdana", "Tahoma", "Trebuchet MS", "Segoe UI",
  "Calibri", "Courier New", "Consolas",
];
const phrase = "Ровно 1249 лет назад мир содрогнулся от катастрофы, вошедшей в хроники как Астериоклизм";

export default function PolygonPage() {
  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/">← На главную</Link>
      <h1>Полигон</h1>
      <p className={styles.note}>Все образцы — 15 пт. Доступность шрифтов зависит от устройства: отсутствующий шрифт заменяется системным.</p>
      {fonts.map((font) => (
        <p className={styles.sample} key={font} style={{ fontFamily: `"${font}", ${["Times New Roman", "Georgia", "Palatino Linotype", "Cambria"].includes(font) ? "serif" : ["Courier New", "Consolas"].includes(font) ? "monospace" : "sans-serif"}` }}>
          {phrase} — {font}
        </p>
      ))}
    </main>
  );
}
