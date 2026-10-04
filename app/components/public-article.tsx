import Image from "next/image";
import Link from "next/link";
import { Article, kindNames } from "@/lib/models";
import PortalShell from "./portal-shell";
import { database } from "@/lib/database";
import EntityLinks from "./entity-links";
import { archiveCategories } from "@/lib/content-details";

export default async function PublicArticle({article}:{article:Article}) {
  const owners=article.owner_id?await database().query<{name:string;discord_name:string;settings:{showDiscord?:boolean}}>("SELECT name,discord_name,settings FROM users WHERE id=$1",[article.owner_id]):[];
  return <PortalShell title={article.title}><p><Link href="/world">← Архив мира</Link> / <Link href={`/library?kind=${article.kind}`}>{kindNames[article.kind]}</Link>{article.details?.category&&<> / <Link href={`/library?kind=lore&category=${article.details.category}`}>{archiveCategories[article.details.category]||article.details.category}</Link></>}</p>{article.kind==="news"&&<p className="section-label">{article.details?.newsType||"Объявление"} · <time dateTime={article.details?.date||article.created_at.slice(0,10)}>{article.details?.date||article.created_at.slice(0,10)}</time></p>}{article.status==="frozen"&&<p className="frozen-banner" role="status">❄ Заморожен — участие персонажа приостановлено администрацией.</p>}<p className="article-lead">{article.summary}</p>{article.image&&<Image className="article-image" src={article.image} alt={article.title} width={1200} height={800} sizes="(max-width: 1200px) 88vw, 1120px" unoptimized={article.image.startsWith("https://")} style={{height:"auto"}}/>}<dl className="article-meta">{article.country&&<div><dt>Страна</dt><dd>{article.country}</dd></div>}{article.race&&<div><dt>Раса</dt><dd>{article.race}</dd></div>}{article.organization&&<div><dt>Организация</dt><dd>{article.organization}</dd></div>}</dl><div className="article-prose">{article.body.split(/\n\s*\n/).map((p,i)=>p.length<100&&!/[.!?]$/.test(p)?<h2 key={i}>{p}</h2>:<p className="prose-text" key={i}>{p}</p>)}</div>{article.details?.blocks?.map((block,i)=><section className="article-prose" key={i}><h2>{block.title}</h2><p className="prose-text">{block.body}</p></section>)}{article.details?.tags&&<nav className="entity-links" aria-label="Теги статьи">{article.details.tags.map(t=><Link href={`/library?q=${encodeURIComponent(t)}`} key={t}>#{t}</Link>)}</nav>}<EntityLinks article={article}/>{owners[0]?.settings.showDiscord&&<p>Игрок: {owners[0].name} · Discord: {owners[0].discord_name}</p>}</PortalShell>;
}

