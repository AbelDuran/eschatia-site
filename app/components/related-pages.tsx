"use client";
import { useEffect,useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
type Related={href:string;title:string;kind:string;reason:string};
export default function RelatedPages(){const path=usePathname();const isArticle=/^\/(characters|countries|organizations|races)\/[^/]+\/?$/.test(path);const [result,setResult]=useState<{path:string;items:Related[]}>({path:"",items:[]});useEffect(()=>{if(!isArticle)return;const controller=new AbortController();fetch(`/api/related?path=${encodeURIComponent(path)}`,{signal:controller.signal}).then(r=>r.ok?r.json():[]).then(items=>setResult({path,items})).catch(()=>{});return()=>controller.abort();},[path,isArticle]);if(!isArticle)return null;const items=result.path===path?result.items:[];return <aside className="related-section" aria-label="Похожие страницы"><p className="section-label">ПРОДОЛЖИТЬ ИССЛЕДОВАНИЕ</p><h2>Похожие страницы</h2>{items.length?<div className="related-grid">{items.map(a=><Link className="related-card" href={a.href} key={a.href}><small>{a.kind}</small><h3>{a.title}</h3><p>{a.reason}</p><span>Открыть →</span></Link>)}</div>:<p><Link href="/library">Открыть мировой архив →</Link></p>}</aside>;}

