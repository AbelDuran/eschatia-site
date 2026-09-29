import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { articleRecord, visible } from "@/lib/public-content";
import { baseArticles } from "@/lib/seed";
import { missing } from "@/lib/content-details";
import catalog from "@/app/data/catalog.json";
import ThemeToggle from "@/app/components/theme-toggle";
import EntityLinks from "@/app/components/entity-links";
export const dynamic="force-dynamic";
export function generateStaticParams(){return catalog.countries.map(({slug})=>({slug}));}
export async function generateMetadata({params}:PageProps<"/countries/[slug]">):Promise<Metadata>{const {slug}=await params;const a=await articleRecord("countries",slug);return {title:a&&visible(a)?`${a.title} — ESCHATIA LA FRONTIER`:"Государство не найдено",description:a&&visible(a)?a.summary:undefined};}
export default async function CountryPage({params}:PageProps<"/countries/[slug]">){
 const {slug}=await params;const a=await articleRecord("countries",slug);if(!a||!visible(a))notFound();
 const c=catalog.countryDetails[slug as keyof typeof catalog.countryDetails];const d=a.details||{};
 const banners:Record<string,string>={jospiora:"/jospiora-city.png",denlin:"/denlin-cliff.png",snowind:"/swowwind-arc.jpg",oratris:"/oratris-city.png",sudros:"/sudros-city.png",nocturn:"/nocturn-city.png"};
 const original=baseArticles.find(x=>x.kind==="countries"&&x.slug===slug);
 const edited=!!original&&a.body!==original.body;
 const hero=a.image!==original?.image?a.image:banners[slug]||a.image;
 const ruler=d.ruler;const blocks=d.blocks||[];
 return <main className="country-page" id="top"><header className="site-header"><Link className="brand" href="/"><span className="brand-star">✦</span><span>ESCHATIA</span><small>LA FRONTIER</small></Link><Link className="text-link" href="/#world">← Все государства</Link><ThemeToggle/></header>
 <section className="country-hero">{hero&&<Image src={hero} alt={`Пейзаж государства ${a.title}`} fill priority unoptimized={hero.startsWith("https://")} sizes="100vw"/>}<div className="country-hero-shade"/><div className="country-hero-content"><p className="section-label">ГОСУДАРСТВО / {c?.kind||"АРХИВ МИРА"}</p><h1>{a.title}</h1><p>{a.summary}</p></div></section>
 <nav className="article-toc" aria-label="Разделы государства"><a href="#country-about">О государстве</a><a href="#ruler">Правитель и вера</a><a href="#country-laws">Законы</a><a href="#country-politics">Политика</a><a href="#country-features">Особенности</a></nav>
 <section className="country-intro section" id="country-about"><p className="section-label">01 / АРХИВ ГОСУДАРСТВА</p><div className="article-prose">{(edited||!c?a.body:c.intro).split(/\n\s*\n/).map((p,i)=><p className="prose-text" key={i}>{p}</p>)}</div><p className="language-note">{d.language||missing("Язык государства")}</p></section>
 <section className="section ruler-section" id="ruler"><p className="section-label">02 / ВЛАСТЬ И РЕЛИГИЯ</p><div className="ruler-grid">{ruler?.image&&<img src={ruler.image} alt={ruler.name} className="ruler-image"/>}<div><h2>Правитель</h2><h3>{ruler?.name||missing("Имя правителя")}</h3><p>{ruler?.title||missing("Титул и форма правления")}</p><p>{ruler?.body||missing("Биография правителя")}</p>{ruler?.href&&<Link href={ruler.href}>Открыть статью →</Link>}</div><div><h2>Господствующая вера</h2><p>{d.faith||missing("Господствующая вера")}</p>{d.faithPath&&<Link className="text-link" href={d.faithPath}>Открыть статью о вере →</Link>}{slug==="sudros"&&<p><Link href="/lore/benefactor">Верховный Благодетель →</Link></p>}</div></div></section>
 <section className="section" id="country-laws"><p className="section-label">03 / ЗАКОНЫ И БЕЗОПАСНОСТЬ</p><div className="country-fact-grid">{c?[["Скверна",c.corruptionAttitude,c.corruptionText],["Вне закона",c.outlaws,c.outlawsText],["Население и права",c.rights,c.rightsText],["Опасность",c.dangerLevel,c.dangerText]].map(([label,title,body])=><article key={label}><p className="section-label">{label}</p><h3>{title}</h3><p>{body}</p></article>):<p>{missing("Законы и безопасность государства")}</p>}</div></section>
 <section className="section" id="country-politics"><p className="section-label">04 / ПОЛИТИКА</p><div className="country-fact-grid">{c?[["Дипломатия",c.allies,c.alliesText],["Вражда",c.enemies,c.enemiesText],["Торговля",c.trade,c.tradeText]].map(([label,title,body])=><article key={label}><p className="section-label">{label}</p><h3>{title}</h3><p>{body}</p></article>):<p>{missing("Внешняя и внутренняя политика")}</p>}</div>{c&&<aside className="country-priority"><p>Текущий приоритет</p><strong>{c.priority}</strong></aside>}</section>
 <section className="section" id="country-features"><p className="section-label">05 / ОСОБЕННОСТИ</p><h2>{slug==="nocturn"?"Четыре столпа Ноктюрна":"Жизнь государства"}</h2><div className={`country-blocks ${slug==="nocturn"?"nocturn-features":""}`}>{blocks.map((b,i)=><article key={i}><span className="section-label">{String(i+1).padStart(2,"0")} / {b.type}</span><h3>{b.title}</h3>{b.body.split(/\n\s*\n/).map((p,j)=><p key={j}>{p}</p>)}</article>)}</div>{!blocks.length&&<p>{missing("Индивидуальные особенности государства")}</p>}<EntityLinks article={a}/></section>
 <footer><span>© 2026 ESCHATIA LA FRONTIER</span><Link href="/world">Архив мира</Link><a href="#top">Наверх ↑</a></footer></main>;
}
