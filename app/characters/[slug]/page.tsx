import { articleRecord, visible } from "@/lib/public-content";
import { characterProfile } from "@/lib/character-profile";
import { database } from "@/lib/database";
import { missing } from "@/lib/content-details";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/app/components/theme-toggle";
import EntityLinks from "@/app/components/entity-links";
import { notFound } from "next/navigation";
import characters from "../../data/characters.json";
export const dynamic = "force-dynamic";
export function generateStaticParams(){return characters.map(({slug})=>({slug}));}
export async function generateMetadata({params}:PageProps<"/characters/[slug]">):Promise<Metadata>{const {slug}=await params;const a=await articleRecord("characters",slug);return {title:a&&visible(a)?`${a.title} — ESCHATIA LA FRONTIER`:"Персонаж не найден",description:a&&visible(a)?a.summary:undefined};}
export default async function CharacterPage({params}:PageProps<"/characters/[slug]">){
 const {slug}=await params;const record=await articleRecord("characters",slug);if(!record||!visible(record))notFound();
 const c=characterProfile(record);
 const [owner]=record.owner_id?await database().query<{name:string;discord_name:string;settings:{showDiscord?:boolean}}>("SELECT name,discord_name,settings FROM users WHERE id=$1",[record.owner_id]):[];
 const paragraphs=(text:string)=>(text||missing("Этот раздел анкеты пока не заполнен.")).split(/\n\s*\n/).map((p,i)=><p className="prose-text" key={i}>{p}</p>);
 return <main className="profile-page" id="top">
  <header className="site-header"><Link className="brand" href="/" aria-label="ESCHATIA LA FRONTIER"><span className="brand-star">✦</span><span>ESCHATIA</span><small>LA FRONTIER</small></Link><Link className="text-link" href="/#characters">← Все персонажи</Link><ThemeToggle/></header>
  <section className="profile-hero">{c.image?<div className="profile-art"><Image src={c.image} alt={`Внешний вид ${c.name}`} fill unoptimized={c.image.startsWith("https://")} preload sizes="(max-width: 760px) 84vw, 360px"/></div>:<div className="profile-art profile-art-placeholder"><span>ПОРТРЕТ<br/>ОЖИДАЕТСЯ</span></div>}
   <div><p className="section-label">ОДОБРЕННЫЙ ПЕРСОНАЖ / {c.country.toUpperCase()}</p>{record.status==="frozen"&&<p className="frozen-banner" role="status">❄ Заморожен — участие приостановлено администрацией.</p>}<p className="piece-status">{c.mark} {c.piece}</p><h1>{c.name}</h1>{c.nickname&&<p className="profile-nickname">«{c.nickname}»</p>}<p className="profile-role">{c.role}</p><p className="profile-copy">{c.shortDescription}</p><p className="profile-affiliation">{c.country} · {c.group}</p>{c.application?<a className="button button-light" href={c.application} target="_blank" rel="noreferrer">Открыть полную анкету ↗</a>:<a className="button button-light" href="#dossier">Открыть полную анкету ↓</a>}</div>
  </section>
  <nav className="article-toc" aria-label="Разделы анкеты"><a href="#dossier">Архивная карта</a><a href="#personality">Характер</a><a href="#features">Особенности</a><a href="#abilities">Способности</a><a href="#biography">Биография</a><a href="#extra">Дополнительно</a></nav>
  <section className="profile-details" id="dossier"><p className="section-label">01 / АРХИВНАЯ КАРТА</p>{[["Страна",c.country],["Организация",c.group],["Статус",record.status==="frozen"?"❄ Заморожен":`${c.mark} ${c.piece}`],["Сословие",c.estate||missing("Сословие")],["Языки",c.languages.join(", ")||missing("Языки")]].map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</section>
  <section className="profile-content" id="personality"><div><p className="section-label">02 / ФИЗИЧЕСКИЕ ДАННЫЕ</p><dl className="physical-list">{c.physical.map(([k,v],i)=><div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div><div><p className="section-label">03 / ХАРАКТЕР</p>{paragraphs(c.personality.join("\n\n"))}</div></section>
  <section className="profile-content dossier-pair"><div id="features"><p className="section-label">04 / ОСОБЕННОСТИ</p><h2>Что определяет героя</h2>{paragraphs(c.features)}</div><div id="abilities"><p className="section-label">05 / СПОСОБНОСТИ</p><h2>Навыки и заклинания</h2>{paragraphs(c.abilities)}</div></section>
  <section className="bio-extracts" id="biography"><div><p className="section-label">06 / БИОГРАФИЯ</p><h2>Записки с борта<br/><em>экспедиции.</em></h2></div><div className="extract-list">{(c.extracts.length?c.extracts:[missing("Биография персонажа")]).map((p,i)=><article key={i}><span>{String(i+1).padStart(2,"0")}</span><p className="prose-text">{p}</p></article>)}</div></section>
  <section className="dossier-extra section" id="extra"><p className="section-label">07 / ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ</p>{paragraphs(c.extra)}<EntityLinks article={record}/>{owner?.settings.showDiscord&&<p>Игрок: {owner.name} · Discord: {owner.discord_name}</p>}</section>
  <footer><span>© 2026 ESCHATIA LA FRONTIER</span><Link href="/start">Как начать играть</Link><a href="#top">Наверх ↑</a></footer>
 </main>;
}
