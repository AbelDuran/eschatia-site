import Link from "next/link";
import { Article, kindNames } from "@/lib/models";
import PortalShell from "./portal-shell";
import { database } from "@/lib/database";

export default async function PublicArticle({article}:{article:Article}) {
  const owners=article.owner_id?await database().query<{name:string;discord_name:string;settings:{showDiscord?:boolean}}>("SELECT name,discord_name,settings FROM users WHERE id=$1",[article.owner_id]):[];
  return <PortalShell title={article.title}><p><Link href="/">← Главная</Link> / {kindNames[article.kind]}</p>{article.status==="frozen"&&<p className="frozen-banner" role="status">❄ Заморожен — участие персонажа приостановлено администрацией.</p>}<p className="article-lead">{article.summary}</p>{article.image&&<img className="article-image" src={article.image} alt={article.title}/>}<dl className="article-meta">{article.country&&<div><dt>Страна</dt><dd>{article.country}</dd></div>}{article.race&&<div><dt>Раса</dt><dd>{article.race}</dd></div>}{article.organization&&<div><dt>Организация</dt><dd>{article.organization}</dd></div>}</dl><div className="article-prose">{article.body.split(/\n\s*\n/).map((p,i)=><p className="prose-text" key={i}>{p}</p>)}</div>{owners[0]?.settings.showDiscord&&<p>Игрок: {owners[0].name} · Discord: {owners[0].discord_name}</p>}</PortalShell>;
}

