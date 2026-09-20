"use client";

import Link from "next/link";
import { useState } from "react";

const countries = [
  { name: "Джоспиора", kind: "Южное королевство", description: "Закон, кровь и готические шпили.", slug: "jospiora", crest: "/jospiora-crest.png" },
  { name: "Денлин", kind: "Вольный край", description: "Пески, чёрный рынок и право сильного.", slug: "denlin", crest: "/denlin-crest.png" },
  { name: "Сноувинд", kind: "Северное царство", description: "Метель, руда и обелиски тепла.", slug: "snowind", crest: "/snowwind-crest.png" },
  { name: "Оратрис", kind: "Святая империя", description: "Сияющий камень и неусыпная Инквизиция.", slug: "oratris", crest: "/oratris-crest.png" },
  { name: "Судрос", kind: "Расколотая империя", description: "Драконы, честь и война за наследие.", slug: "sudros", crest: "/sudros-crest.png" },
  { name: "Ноктюрн", kind: "Тёмное княжество", description: "Вечные сумерки у границы Новых Земель.", slug: "nocturn", crest: "/nocturn-crest.png" },
];
const groups = [
  { name: "Шабаш Ведьм", kind: "След Первой", description: "Когда-то они пытались удержать треснувший мир.", slug: "witches-coven", crest: "/witches.webp" },
  { name: "Ковен", kind: "Тайное знание", description: "Осколки запретного знания пережили века.", slug: "coven", crest: "/koven.webp" },
  { name: "ΑΣΚΑΛΙΤΗΣ", kind: "Неизвестно", description: "Они знают то, чего не должны знать.", slug: "askalites", crest: "/SECRET.jpg" },
  { name: "Епархия Богохульного Древа", kind: "Культ распада", description: "Вера в энтропию и моральное освобождение.", slug: "blasphemy-tree-diocese", crest: "/eparchia-crest.jpeg" },
  { name: "Объединение Фаренгейт", kind: "Исследователи", description: "Там, где наука подходит слишком близко к Скверне.", slug: "fahrenheit", crest: "/fahrenheit-crest.jpeg" },
  { name: "Сангвиниум", kind: "Плоть и ресурсы", description: "Один из четырёх столпов Ноктюрна.", slug: "sanguinium", crest: "/sanguinium-crest.jpg" },
  { name: "Церковь Тёмной Руки", kind: "Теневая вера", description: "Сила, которая действует вне света и закона.", slug: "dark-hand-church", crest: "/church-crest.png" },
  { name: "Притон Лорса", kind: "Синдикат", description: "Крысы нижнего города.", slug: "lorsa", crest: "/lorsa-crest.png" },
  { name: "Лунные Волки", kind: "Партизаны", description: "Один за стаю, стая за каждого.", slug: "moon-wolves", crest: "/wolves-crest.png" },
  { name: "Воздухоловы", kind: "Работорговцы", description: "В Денлине ничего не должно пропадать впустую.", slug: "windcatchers", crest: "/windcatchers-crest.png" },
  { name: "Э.Н.Т", kind: "Наёмники", description: "Автономная силовая структура, специализирующаяся на точечных ликвидациях и массовом хаосе.", slug: "ent", crest: "/ant-crest.png" },
  { name: "Кровавый День", kind: "Еретики", description: "Очищающий кровью террор против Империи.", slug: "blood-day", crest: "/bloodday-crest.png" },
  { name: "Орден Охотников за Бездной", kind: "Истребители", description: "Бездна не должна переступить порог.", slug: "void-hunters-order", crest: "/abysshunters-crest.jpeg" },
  { name: "Гвардия Короны", kind: "Государственная сила", description: "Когда штормит вокруг страна — лишь сила Закона тверда и равна.", slug: "guardian", crest: "/guardian-crest.jpeg" },
  { name: "Бледный Ансамбль", kind: "Наёмники", description: "Мы превращаем смерть в премьеру.", slug: "bleak-ensemble", crest: "/ansamble-crest.png" },
  { name: "Отверженные Гербы", kind: "Орден ренегатов", description: "Если твой брат попал в петлю, ты берёшь его меч и дописываешь его вендетту.", slug: "outcasts", crest: "/outcasts-crest.jpeg" },
  { name: "Хроматический Артель", kind: "Художники", description: "Искусство как способ познания человеческого естества через эмоции, страдание, страх, красоту и смерть.", slug: "chromatic", crest: "/chromatic-crest.png" },
  { name: "Крылья Анку", kind: "Наёмники", description: "Беспрекословная дисциплина, идеальное исполнение приказа и сохранение внутренней автономии.", slug: "wings", crest: "/wings-crest.png" },
  { name: "72 Благословения", kind: "Культ", description: "Эскхатия — священная земля, доступ к которой должен принадлежать исключительно тем, кого организация признаёт достойными.", slug: "blessings", crest: "/blessings-crest.png" },
];
const characters = [
  { name: "Абель Дюран", role: "Подмастерье врачевателя", country: "Джоспиора", group: "Без организации", mark: "♜", slug: "abel-duran", image: "/abel-duran.png" },
  { name: "Альберт Фон Карма", role: "Наёмник и искатель реликвий", country: "Джоспиора", group: "Без организации", mark: "♟", slug: "albert-fon-karma", image: "" },
];

export default function Home() {
  const [country, setCountry] = useState("Все страны");
  const [group, setGroup] = useState("Все организации");
  const [menuOpen, setMenuOpen] = useState(false);
  const filtered = characters.filter((character) => (country === "Все страны" || character.country === country) && (group === "Все организации" || character.group === group));
  const closeMenu = () => setMenuOpen(false);

  return <main>
    <header className="site-header">
      <a className="brand" href="#top" onClick={closeMenu} aria-label="Eschatia La Frontier"><span className="brand-star">✦</span><span>ESCHATIA</span><small>LA FRONTIER</small></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Открыть меню"><span /> <span /></button>
      <nav className={menuOpen ? "nav nav-open" : "nav"}><a href="#news" onClick={closeMenu}>Новости</a><a href="#characters" onClick={closeMenu}>Персонажи</a><a href="#world" onClick={closeMenu}>О мире</a><a className="nav-cta" href="#join" onClick={closeMenu}>Вступить</a></nav>
    </header>
    <section className="hero" id="top"><div className="hero-grain" /><div className="hero-horizon" /><div className="hero-spire spire-one" /><div className="hero-spire spire-two" /><div className="hero-content"><p className="eyebrow">1249 ГОД ОТ КАТАСТРОФЫ</p><h1>Мир уже<br /><em>сломался.</em></h1><p className="hero-copy">За границами старого света Скверна дышит в руинах, а экспедиция уходит туда, откуда никто не возвращался прежним.</p><a className="button button-light" href="#join">Начать путешествие <span>↗</span></a></div><div className="hero-footer"><span>SCROLL TO DESCEND</span><span>◌</span><span>ESCHATIA / 1249</span></div></section>
    <section className="intro section"><p className="section-label">01 / КРАТКО О МИРЕ</p><div className="intro-grid"><h2>Пыль вместо<br />магии.</h2><div><p>1249 лет назад Астериоклизм расколол источник магии. Небо пролило ядовитый свет, а чистая сила стала Скверной — даром, который забирает тело и разум.</p><p>Теперь осквернённые несут могущество вместе с болью, а старый континент готовит экспедицию в Новые Земли.</p><a className="text-link" href="#world">Прочитать архив мира <span>→</span></a></div></div></section>
    <section id="news" className="news section dark-section"><div className="section-heading"><p className="section-label">02 / ПОСЛЕДНИЕ СВОДКИ</p><a className="text-link light" href="#join">Все новости <span>→</span></a></div><div className="news-grid"><article className="news-feature"><p>СОБЫТИЕ / 12.09.1249</p><h3>Экспедиция<br /><em>в Новые Земли</em></h3><span>Запись открыта</span></article><article className="news-item"><p>ОБНОВЛЕНИЕ / 08.09.1249</p><h3>Архив Ноктюрна<br />пополнен</h3><a href="#world">Читать <span>↗</span></a></article><article className="news-item"><p>ПЕРСОНАЖИ / 04.09.1249</p><h3>Шесть новых<br />лиц в хронике</h3><a href="#characters">Смотреть <span>↗</span></a></article></div></section>
    <section id="characters" className="characters section"><div className="section-heading"><div><p className="section-label">03 / ЖИВЫЕ ИМЕНА</p><h2>Персонажи</h2></div><p className="muted">Все одобренные<br />истории сервера</p></div><div className="filters" aria-label="Фильтры персонажей"><label>Страна<select value={country} onChange={(event) => setCountry(event.target.value)}><option>Все страны</option>{countries.map(({ name }) => <option key={name}>{name}</option>)}</select></label><label>Организация<select value={group} onChange={(event) => setGroup(event.target.value)}><option>Все организации</option><option>Без организации</option>{groups.map((group) => <option key={group.name}>{group.name}</option>)}</select></label><span className="result-count">{filtered.length.toString().padStart(2, "0")} ИМЁН НАЙДЕНО</span></div><div className="character-grid">{filtered.map((character) => <article className="character-card" key={character.name}><div className={character.image ? "portrait portrait-photo" : "portrait portrait-placeholder"} style={character.image ? { backgroundImage: `url(${character.image})` } : undefined}><span>{character.mark}</span>{!character.image && <small>ПОРТРЕТ ОЖИДАЕТСЯ</small>}</div><div><p>{character.country} / {character.group}</p><h3>{character.name}</h3><span>{character.role}</span></div><a className="profile-button" href={`/characters/${character.slug}`} aria-label={`Открыть профиль ${character.name}`}>↗</a></article>)}{filtered.length === 0 && <p className="empty">В этом архиве пока нет совпадений.</p>}</div></section>
    <section id="world" className="world section"><p className="section-label">04 / АТЛАС ФАРЕЛЬВЕЙТА</p><div className="world-heading"><h2>Узнай, где<br /><em>тебе выжить.</em></h2><p>Шесть государств, десятки сил и одна неизбежная Скверна. Выбери сторону прежде, чем она выберет тебя.</p></div><div className="country-list">{countries.map((entry, index) => {
      const row = <><span>0{index + 1}</span><div className="country-identity">{entry.crest ? <img className="country-crest" src={entry.crest} alt={`Герб ${entry.name}`} /> : null}<div><h3>{entry.name}</h3><p>{entry.kind}</p></div></div><p className="country-description">{entry.description}</p><span className="arrow">↗</span></>;
      return entry.slug ? <Link className="country-row" href={`/countries/${entry.slug}`} key={entry.name}>{row}</Link> : <article className="country-row" key={entry.name}>{row}</article>;
    })}</div></section>
    <section className="organizations section dark-section"><p className="section-label">05 / ЧЬЯ СТОРОНА</p><h2>Организации</h2><div className="org-grid">{groups.map((group) => <Link className="org-card" href={`/organizations/${group.slug}`} key={group.name}>{group.crest ? <img className="org-crest" src={group.crest} alt={`Герб ${group.name}`} /> : <span className="sigil">✧</span>}<p>{group.kind}</p><h3>{group.name}</h3><span>{group.description}</span></Link>)}</div></section>
    <section id="join" className="join"><div className="join-symbol">✦</div><p className="section-label">ТВОЯ ИСТОРИЯ НАЧИНАЕТСЯ ЗДЕСЬ</p><h2>Войди в<br /><em>Эсхатию.</em></h2><p>Собери персонажа. Найди союзников. Оставь след в истории мира, который продолжает гнить.</p><div className="join-actions"><a className="button button-dark" href="https://discord.gg/dpGsTrewME" target="_blank" rel="noreferrer">Открыть Discord <span>↗</span></a><a className="text-link" href="#characters">Посмотреть персонажей <span>→</span></a></div></section>
    <footer><span>© 2026 ESCHATIA LA FRONTIER</span><span>ROLEPLAY UNIVERSE</span><a href="#top">НАВЕРХ ↑</a></footer>
  </main>;
}
