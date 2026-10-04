"use client";
import Link from "next/link";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="portal-wrap"><p className="section-label">ESCHATIA LA FRONTIER</p><h1>Архив временно недоступен</h1><p>Не удалось загрузить страницу. Попробуйте ещё раз.</p><div className="portal-actions"><button className="button" onClick={reset}>Повторить</button><Link href="/">На главную</Link></div></main>;}
