import { articleRecord, visible } from "@/lib/public-content";
import PublicArticle from "@/app/components/public-article";
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/app/components/theme-toggle";
import { notFound } from "next/navigation";
import races from "../../data/races.json";

const families = new Set(["Млекопитающие", "Птицы", "Рептилии", "Амфибии", "Рыбы", "Паукообразные"]);

export function generateStaticParams() {
  return races.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/races/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const record=await articleRecord("races",slug);
  if(record)return {title:visible(record)?record.title+" — ESCHATIA LA FRONTIER":"Материал не найден",description:visible(record)?record.summary:undefined};
  const race = races.find((entry) => entry.slug === slug);
  return { title: race ? `${race.name} — ESCHATIA LA FRONTIER` : "Раса не найдена", description: race?.summary };
}

export default async function RacePage({ params }: PageProps<"/races/[slug]">) {
  const { slug } = await params;
  const record=await articleRecord("races",slug);
  if(record&&!visible(record))notFound();
  if(record&&(record.version>1||!races.some(entry=>entry.slug===slug)))return <PublicArticle article={record}/>;
  const race = races.find((entry) => entry.slug === slug);
  if (!race) notFound();

  return (
    <main className="race-page">
      <header className="site-header">
        <Link className="brand" href="/"><span className="brand-star">✦</span><span>ESCHATIA</span><small>LA FRONTIER</small></Link>
        <Link className="text-link" href="/#races">← Все расы</Link>
      <ThemeToggle /></header>
      <section className="race-hero">
        <div>
          <p className="section-label">Народы Фарельвейта</p>
          <h1>{race.name}</h1>
          <p className="race-tagline">{race.tagline}</p>
        </div>
        <div className="race-image">
          <Image
            src={race.image}
            alt={`Представители расы: ${race.name}`}
            width={race.imageWidth}
            height={race.imageHeight}
            preload
            sizes="(max-width: 760px) 84vw, 35vw"
          />
        </div>
      </section>
      <div className="race-body">
        <nav className="race-contents" aria-label="Разделы описания расы">
          {race.sections.map((section, index) => <a key={section.title} href={`#section-${index}`}>{section.title}</a>)}
        </nav>
        <article className="race-copy">
          {race.sections.map((section, index) => (
            <section id={`section-${index}`} key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((text, paragraphIndex) => families.has(text)
                ? <h3 key={paragraphIndex}>{text}</h3>
                : <p key={paragraphIndex}>{text}</p>)}
            </section>
          ))}
          <Link className="text-link" href="/#races">← Вернуться к расам</Link>
        </article>
      </div>
    </main>
  );
}
