import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/app/components/theme-toggle";
import { notFound } from "next/navigation";

import characters from "../../data/characters.json";

export function generateStaticParams() {
  return characters.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/characters/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const character = characters.find((entry) => entry.slug === slug);
  return { title: character ? character.name + " — Eschatia" : "Персонаж не найден", description: character?.shortDescription };
}

export default async function CharacterPage({ params }: PageProps<"/characters/[slug]">) {
  const { slug } = await params;
  const character = characters.find((entry) => entry.slug === slug);
  if (!character) notFound();
  const { piece, shortDescription, extracts } = character;
  const characterText = character.personality.map((paragraph, index) => <p key={index}>{paragraph}</p>);
  const extra = <a className="text-link" href={character.application} target="_blank" rel="noreferrer">Прочитать полностью <span>→</span></a>;
  return <main className="profile-page" id="top"><header className="site-header"><Link className="brand" href="/"><span className="brand-star">✦</span><span>ESCHATIA</span><small>LA FRONTIER</small></Link><Link className="text-link" href="/#characters">← Все персонажи</Link><ThemeToggle /></header><section className="profile-hero">{character.image ? <div className="profile-art"><Image src={character.image} alt={`Внешний вид ${character.name}`} fill preload sizes="(max-width: 428px) 84vw, 360px" /></div> : <div className="profile-art profile-art-placeholder"><span>ПОРТРЕТ<br />ОЖИДАЕТСЯ</span></div>}<div><p className="section-label">ОДОБРЕННЫЙ ПЕРСОНАЖ / {character.country.toUpperCase()}</p><p className="piece-status">{character.mark} {piece.toUpperCase()}</p><h1>{character.name}</h1><p className="profile-role">{character.role}</p><p className="profile-copy">{shortDescription}</p><a className="button button-light" href={character.application} target="_blank" rel="noreferrer">Открыть полную анкету <span>↗</span></a></div></section><section className="profile-details"><p className="section-label">АРХИВНАЯ КАРТА</p><div><span>СТРАНА</span><strong>{character.country}</strong></div><div><span>ОРГАНИЗАЦИЯ</span><strong>{character.group}</strong></div><div><span>СТАТУС</span><strong>{character.mark} {piece}</strong></div></section><section className="profile-content"><div><p className="section-label">ФИЗИЧЕСКИЕ ДАННЫЕ</p><dl className="physical-list">{character.physical.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div><div><p className="section-label">ХАРАКТЕР</p>{characterText}</div></section><section className="bio-extracts"><div><p className="section-label">ВЫДЕРЖКИ ИЗ БИОГРАФИИ</p><h2>Записки с борта<br /><em>экспедиции.</em></h2></div><div className="extract-list">{extracts.map((extract, index) => <article key={index}><span>0{index + 1}</span><p>{extract}</p></article>)}</div>{extra}</section><footer><span>c 2026 ESCHATIA LA FRONTIER</span><span>ROLEPLAY UNIVERSE</span><a href="#top">Вернуться наверх ↑</a></footer></main>;
}
