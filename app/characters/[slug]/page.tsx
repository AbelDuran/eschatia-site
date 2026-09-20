import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const characters = {
  "abel-duran": {
    name: "Абель Дюран",
    mark: "♜",
    country: "Джоспиора",
    group: "Без организации",
    role: "Подмастерье врачевателя",
    image: "/abel-duran.png",
    application: "https://discord.com/channels/1492409417109475449/1549406089832038430",
    physical: [
      ["Раса", "Человек"],
      ["Возраст", "11 лет"],
      ["Рост", "140 см"],
      ["Вес", "31 кг"],
    ],
  },
  "albert-fon-karma": {
    name: "Альберт Фон Карма",
    mark: "♟",
    country: "Джоспиора",
    group: "Без организации",
    role: "Наёмник и искатель реликвий",
    image: "/albert-von-karma.png",
    application: "https://discord.com/channels/1492409417109475449/1549051924249321543",
    physical: [
      ["Раса", "Человек"],
      ["Возраст", "25 лет"],
      ["Рост", "180 см"],
      ["Вес", "73 кг"],
    ],
  },
};

export function generateStaticParams() { return Object.keys(characters).map((slug) => ({ slug })); }

export default async function CharacterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = characters[slug as keyof typeof characters];
  if (!character) notFound();
  const isAbel = slug === "abel-duran";
  const piece = isAbel ? "Ладья" : "Пешка";
  const shortDescription = isAbel ? "Уроженка Джоспиоры и подмастерье врачевателя, не состоящая в организациях." : "Уроженец Джоспиоры, наёмник и искатель реликвий, следующий за багровым пером Twilight.";
  const characterText = isAbel ? <><p>Упрямая, болтливая и суеверная девочка с богатым воображением. С незнакомцами она настороженна и порой пуглива, особенно с представителями других рас: слухам она верит быстрее, чем собственному опыту.</p><p>За внешней покорностью прячется тихий бунт. Абель знает цену месту ученицы, старается не конфликтовать с наставником, но мечтает окончить обучение и самой распоряжаться своей жизнью.</p></> : <><p>Дружелюбный и лёгкий в общении, Альберт скорее разрядит неловкую ситуацию шуткой, чем позволит ей повиснуть в тишине. Он ценит искренность и верность, но не принимает доверие за наивность.</p><p>Он понимает жестокость мира и умеет причинять вред, если нужно защитить себя или товарищей. Альберт особенно не терпит тех, кто пользуется силой, чтобы ломать чужие жизни.</p></>;
  const extracts = isAbel ? ["Абель отправилась в Новые Земли вместе с наставником Гарибальди — бывшим дворцовым врачом, который ищет новую возможность заработать. Для неё это был не столько выбор, сколько единственный путь.", "Детство в деревне оставило ей память о простых играх, травмах и первом знакомстве с врачеванием. Позже она получила возможность учиться грамоте, алхимии и основам лечения.", "Она ведёт собственный журнал о путешествии и надеется вернуться уже мастерицей, которой доверят лечить больных самостоятельно."] : ["Сын кузнеца и торговки тканями вырос в обычном квартале Джоспиоры. После исчезновения отца, призванного в армию, Альберт занял его место, а затем стал брать охранные заказы.", "Во время сомнительной контрабандистской вылазки он получил странное багровое перо. Сны, головная боль и обрывки чужой жизни постепенно сделали реликвию его личной тайной.", "Он отправился в экспедицию, чтобы найти связь между Скверной, пером Twilight и воспоминаниями о мире, которого будто бы никогда не существовало."];
  const extra = <a className="text-link" href={character.application} target="_blank" rel="noreferrer">Прочитать полностью <span>→</span></a>;
  return <main className="profile-page"><header className="site-header"><Link className="brand" href="/"><span className="brand-star">✦</span><span>ESCHATIA</span><small>LA FRONTIER</small></Link><Link className="text-link" href="/#characters">← Все персонажи</Link></header><section className="profile-hero">{character.image ? <div className="profile-art"><Image src={character.image} alt={`Внешний вид ${character.name}`} fill priority sizes="(max-width: 760px) 70vw, 32vw" /></div> : <div className="profile-art profile-art-placeholder"><span>ПОРТРЕТ<br />ОЖИДАЕТСЯ</span></div>}<div><p className="section-label">ОДОБРЕННЫЙ ПЕРСОНАЖ / {character.country.toUpperCase()}</p><p className="piece-status">{character.mark} {piece.toUpperCase()}</p><h1>{character.name}</h1><p className="profile-role">{character.role}</p><p className="profile-copy">{shortDescription}</p><a className="button button-light" href={character.application} target="_blank" rel="noreferrer">Открыть полную анкету <span>↗</span></a></div></section><section className="profile-details"><p className="section-label">АРХИВНАЯ КАРТА</p><div><span>СТРАНА</span><strong>{character.country}</strong></div><div><span>ОРГАНИЗАЦИЯ</span><strong>{character.group}</strong></div><div><span>СТАТУС</span><strong>{character.mark} {piece}</strong></div></section><section className="profile-content"><div><p className="section-label">ФИЗИЧЕСКИЕ ДАННЫЕ</p><dl className="physical-list">{character.physical.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div><div><p className="section-label">ХАРАКТЕР</p>{characterText}</div></section><section className="bio-extracts"><div><p className="section-label">ВЫДЕРЖКИ ИЗ БИОГРАФИИ</p><h2>Записки с борта<br /><em>экспедиции.</em></h2></div><div className="extract-list">{extracts.map((extract, index) => <article key={index}><span>0{index + 1}</span><p>{extract}</p></article>)}</div>{extra}</section><footer><span>c 2026 ESCHATIA LA FRONTIER</span><span>ROLEPLAY UNIVERSE</span><a href="#top">Вернуться наверх ↑</a></footer></main>;
}
