"use client";
import {imageSource} from "@/lib/image-source";

import Link from "next/link";
import VisitorPath from "./visitor-path";
import QuickNav from "./quick-nav";
import ThemeToggle from "@/app/components/theme-toggle";
import { useState } from "react";
import type { HomeData } from "@/lib/public-content";


const races = ["Зверолюд", "Хорд", "Вампир", "Нежить", "Скайзерновец", "Конструкт", "Дворф", "Дроу", "Эльф", "Человек"];
const skills = ["Фехтование", "Тяжёлое вооружение", "Стрельба", "Алхимия", "Големостроение", "Артефактная ковка", "Потоковое зрение", "Стабилизация", "Контроль менталитета", "Мутаоз", "Акробатика", "Взлом", "Мгновенный рывок", "Знание древних языков"];

export default function Home({characters,countries,groups,raceCatalog,news}:HomeData) {
  const [country, setCountry] = useState("Все страны");
  const [group, setGroup] = useState("Все организации");
  const [race, setRace] = useState("Все расы");
  const [corruption, setCorruption] = useState("Любая скверна");
  const [skill, setSkill] = useState("Все навыки");
  const [sort, setSort] = useState("Сначала новые");
  const [allCharacters, setAllCharacters] = useState(false);
  const [allGroups, setAllGroups] = useState(false);
  const [allRaces, setAllRaces] = useState(false);
  const [advanced,setAdvanced]=useState(false);
  const [language,setLanguage]=useState("");const [estate,setEstate]=useState("");const [sector,setSector]=useState("");const [status,setStatus]=useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const filtered = characters
    .filter(c=>(!language||c.details.languages?.includes(language))&&(!estate||c.details.estate===estate)&&(!sector||c.details.sector===sector)&&(!status||(status==="frozen"?c.frozen:!c.frozen)))
    .filter((character) => (country === "Все страны" || character.country === country) && (group === "Все организации" || character.group === group) && (race === "Все расы" || character.race === race) && (corruption === "Любая скверна" || character.corruption === corruption) && (skill === "Все навыки" || character.skills.includes(skill)))
    .sort((a, b) => {
      return sort === "Сначала новые"
        ? b.creationOrder - a.creationOrder
        : a.creationOrder - b.creationOrder;
    });
  const closeMenu = () => setMenuOpen(false);

  return <main className="home-page" id="top">
    <header className="site-header">
      <a className="brand" href="#top" onClick={closeMenu} aria-label="Eschatia La Frontier"><span className="brand-star">✦</span><span>ESCHATIA</span><small>LA FRONTIER</small></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen?"Закрыть меню":"Открыть меню"} aria-expanded={menuOpen} aria-controls="home-menu"><span /> <span /></button>
      <nav id="home-menu" className={menuOpen ? "nav nav-open" : "nav"}><a href="#news" onClick={closeMenu}>Новости</a><a href="#characters" onClick={closeMenu}>Персонажи</a><a href="#world" onClick={closeMenu}>О мире</a><a href="#races" onClick={closeMenu}>Расы</a><Link href="/account" onClick={closeMenu}>Кабинет</Link><Link href="/polygon" onClick={closeMenu}>Полигон</Link><a className="nav-cta" href="#join" onClick={closeMenu}>Вступить</a></nav>
    <ThemeToggle /></header><QuickNav/><VisitorPath/>
    <section className="hero"><div className="hero-grain" /><div className="hero-horizon" /><div className="hero-spire spire-one" /><div className="hero-spire spire-two" /><div className="hero-content"><p className="eyebrow">1249 ГОД ОТ КАТАСТРОФЫ</p><h1>Мир уже<br /><em>сломался.</em></h1><p className="hero-copy">За границами старого света Скверна дышит в руинах, а экспедиция уходит туда, откуда никто не возвращался прежним.</p><Link className="button button-light" href="/start">Как начать играть <span>↗</span></Link></div><div className="hero-footer"><span>ЛИСТАЙТЕ ВНИЗ</span><span>◌</span><span>ESCHATIA / 1249</span></div></section>
    <section className="intro section" id="intro"><p className="section-label">01 / КРАТКО О МИРЕ</p><h2>Пыль вместо магии.</h2><div className="world-overview">
      <p>1249 лет назад Астериоклизм расколол источник магии. Чистая сила переродилась в Пыль, а колдовство стало неотделимо от Скверны: она дарует могущество, но постепенно захватывает душу, истощает тело и разрушает разум.</p>
      <p>За прошедшие века народы Фарельвейта приспособились к новым законам. Здесь соседствуют огнестрельное оружие, древние традиции и опасное колдовство. Государства по-разному относятся к осквернённым, а за границами знакомого мира лежат Новые Земли.</p>
      <p>Экспедиция открывает путь в неизведанное. Основной сюжет развивается по главам; владеть магией можно уже на старте, но её цена и последствия остаются частью истории. Мир жесток: решения персонажей имеют вес, а смерть может стать окончательной.</p>
    </div><Link className="text-link" href="/world">Прочитать архив мира <span>→</span></Link></section>
    <section id="news" className="news section dark-section"><div className="section-heading"><p className="section-label">02 / ПОСЛЕДНИЕ СВОДКИ</p><Link className="text-link light" href="/library?kind=news">Все новости <span>→</span></Link></div><div className="news-grid">{news.map((item,index)=><article className={index===0?"news-feature news-with-image":"news-item news-with-image"} style={item.image?{backgroundImage:`url("${imageSource(item.image).replaceAll('"', '%22')}")`}:undefined} key={item.slug}><p>{item.newsType} · {item.date||"Дата не указана"}</p><h3>{item.title}</h3><p>{item.summary}</p><Link href={`/news/${item.slug}`}>Читать →</Link></article>)}</div></section>
    <section id="characters" className="characters section"><div className="section-heading"><div><p className="section-label">03 / ЖИВЫЕ ИМЕНА</p><h2>Персонажи</h2></div><p className="muted">Все одобренные<br />истории сервера</p></div><div className="filter-chips" aria-label="Быстрый выбор государства">{["Все страны",...countries.map(c=>c.name)].map(n=><button key={n} aria-pressed={country===n} onClick={()=>setCountry(n)}>{n}</button>)}</div><div className="filter-toolbar"><label>Раса<select value={race} onChange={e=>setRace(e.target.value)}><option>Все расы</option>{races.map(n=><option key={n}>{n}</option>)}</select></label><label>Создан<select value={sort} onChange={e=>setSort(e.target.value)}><option>Сначала новые</option><option>Сначала старые</option></select></label><button aria-expanded={advanced} onClick={()=>setAdvanced(!advanced)}>{advanced?"Скрыть фильтры":"Другие фильтры"}</button><button onClick={()=>{setCountry("Все страны");setRace("Все расы");setGroup("Все организации");setSkill("Все навыки");setCorruption("Любая скверна");setLanguage("");setEstate("");setSector("");setStatus("");}}>Сбросить</button></div>{advanced&&<div className="filters advanced-filters"><label>Организация<select value={group} onChange={e=>setGroup(e.target.value)}><option>Все организации</option>{Array.from(new Set(characters.map(c=>c.group))).map(n=><option key={n}>{n}</option>)}</select></label><label>Язык<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="">Все языки</option>{Array.from(new Set(characters.flatMap(c=>c.details.languages||[]))).map(n=><option key={n}>{n}</option>)}</select></label><label>Сословие<select value={estate} onChange={e=>setEstate(e.target.value)}><option value="">Все сословия</option>{Array.from(new Set(characters.map(c=>c.details.estate).filter(Boolean))).map(n=><option key={n}>{n}</option>)}</select></label><label>Сектор<select value={sector} onChange={e=>setSector(e.target.value)}><option value="">Все секторы</option>{Array.from(new Set(characters.map(c=>c.details.sector).filter(Boolean))).map(n=><option key={n}>{n}</option>)}</select></label><label>Статус<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Все статусы</option><option value="active">Активен</option><option value="frozen">Заморожен</option></select></label><label>Скверна<select value={corruption} onChange={e=>setCorruption(e.target.value)}><option>Любая скверна</option><option>Есть</option><option>Нет</option></select></label><label>Навык<select value={skill} onChange={e=>setSkill(e.target.value)}><option>Все навыки</option>{Array.from(new Set([...skills,...characters.flatMap(c=>c.skills)])).map(n=><option key={n}>{n}</option>)}</select></label></div>}<p className="result-count">{filtered.length.toString().padStart(2, "0")} ИМЁН НАЙДЕНО</p><div className="character-grid">{(allCharacters ? filtered : filtered.slice(0, 4)).map((character) => <article className={`character-card${character.frozen ? " character-frozen" : ""}`} key={character.slug}><div className="portrait portrait-photo" style={{ backgroundImage: `url(${imageSource(character.image,160,220)})` }}><span>{character.mark}</span></div><div><p>{character.country} / {character.group}</p><h3>{character.name}</h3>{character.frozen&&<strong className="frozen-badge">❄ Заморожен</strong>}{character.details.nickname&&<p className="card-nickname">«{character.details.nickname}»</p>}<span>{character.details.role||character.role}</span><p className="card-facts">{character.race} · {character.details.age||"Возраст не указан"} · {character.frozen?"Заморожен":"Активен"}</p><p className="card-summary">{character.shortDescription}</p></div><Link className="profile-button" href={`/characters/${character.slug}`} aria-label={`Открыть профиль ${character.name}`}>↗</Link></article>)}{filtered.length === 0 && <p className="empty">В этом архиве пока нет совпадений.</p>}</div>{filtered.length > 4 && <button className="catalogue-more" aria-expanded={allCharacters} onClick={() => setAllCharacters((expanded) => !expanded)}>{allCharacters ? "Скрыть" : "Читать далее"} <span aria-hidden="true">{allCharacters ? "↑" : "↓"}</span></button>}</section>
    <section id="world" className="world section"><p className="section-label">04 / АТЛАС ФАРЕЛЬВЕЙТА</p><div className="world-heading"><h2>Узнай где тебе выжить.</h2><p className="world-description">Шесть государств, десятки сил и одна неизбежная Скверна. Выбери сторону прежде, чем она выберет тебя.</p></div><div className="country-list">{countries.map((entry, index) => {
      const row = <><span>0{index + 1}</span><div className="country-identity">{entry.crest ? <img loading="lazy" decoding="async" className="country-crest" src={entry.crest} alt={`Герб ${entry.name}`} /> : null}<div><h3>{entry.name}</h3><p>{entry.kind}</p></div></div><p className="country-description">{entry.description}</p><span className="arrow">↗</span></>;
      return entry.slug ? <Link className="country-row" href={`/countries/${entry.slug}`} key={entry.name}>{row}</Link> : <article className="country-row" key={entry.name}>{row}</article>;
    })}</div></section>
    <section id="organizations" className="organizations section dark-section"><p className="section-label">05 / ЧЬЯ СТОРОНА</p><h2>Организации</h2><div className="org-grid">{(allGroups ? groups : groups.slice(0, 4)).map((group) => <Link className="org-card" href={`/organizations/${group.slug}`} key={group.name}>{group.crest ? <img loading="lazy" decoding="async" className="org-crest" src={group.crest} alt={`Герб ${group.name}`} /> : <span className="sigil">✧</span>}<p>{group.kind}</p><h3>{group.name}</h3><span>{group.description}</span></Link>)}</div>{groups.length > 4 && <button className="catalogue-more" aria-expanded={allGroups} onClick={() => setAllGroups((expanded) => !expanded)}>{allGroups ? "Скрыть" : "Читать далее"} <span aria-hidden="true">{allGroups ? "↑" : "↓"}</span></button>}</section>
    <section id="races" className="races section">
      <div className="section-heading"><div><p className="section-label">06 / НАРОДЫ ФАРЕЛЬВЕЙТА</p><h2>Расы</h2></div></div>
      <div className="race-grid">
        {(allRaces ? raceCatalog : raceCatalog.slice(0, 4)).map((entry, index) => (
          <Link className="race-card" href={`/races/${entry.slug}`} key={entry.slug}>
            <span className="race-number">{String(index + 1).padStart(2, "0")} /</span>
            <h3>{entry.name}</h3><p>{entry.summary}</p>
            <span className="race-card-link">Описание и особенности <span aria-hidden="true">↗</span></span>
          </Link>
        ))}
      </div>
      {raceCatalog.length > 4 && <button className="catalogue-more" aria-expanded={allRaces} onClick={() => setAllRaces((expanded) => !expanded)}>{allRaces ? "Скрыть" : "Читать далее"} <span aria-hidden="true">{allRaces ? "↑" : "↓"}</span></button>}
    </section>
    <section id="join" className="join"><div className="join-symbol">✦</div><p className="section-label">ТВОЯ ИСТОРИЯ НАЧИНАЕТСЯ ЗДЕСЬ</p><h2>Начни путь<br /><em>в Эсхатии.</em></h2><p>Собери персонажа. Найди союзников. Оставь след в истории мира, который продолжает гнить.</p><div className="join-actions"><a className="button button-dark" href="https://discord.gg/dpGsTrewME" target="_blank" rel="noreferrer">Открыть Discord <span>↗</span></a><Link className="text-link" href="/start">Как создать персонажа <span>→</span></Link></div></section>
    <footer><span>© 2026 ESCHATIA LA FRONTIER</span><span>ROLEPLAY UNIVERSE</span><a href="#top">НАВЕРХ ↑</a></footer>
  </main>;
}
