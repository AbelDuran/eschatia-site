"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
const items=[["intro","Мир"],["characters","Персонажи"],["world","Государства"],["organizations","Организации"],["races","Расы"],["news","Новости"]];
export default function QuickNav(){const [active,setActive]=useState("");useEffect(()=>{const update=()=>{const sections=items.map(([id])=>document.getElementById(id)).filter((e):e is HTMLElement=>!!e).sort((a,b)=>a.offsetTop-b.offsetTop);setActive(sections.filter(e=>e.getBoundingClientRect().top<180).at(-1)?.id||"");};update();window.addEventListener("scroll",update,{passive:true});return()=>window.removeEventListener("scroll",update);},[]);return <nav className="quick-nav" aria-label="Разделы главной страницы">{items.map(([id,label])=><a key={id} href={id==="intro"?"/world":`#${id}`} aria-current={active===id?"location":undefined}>{label}</a>)}<Link href="/start">Как начать ↗</Link><Link href="/library">Поиск ↗</Link></nav>;}
