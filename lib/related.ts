import { randomInt } from "node:crypto";
import { publicIndex } from "./public-content";
import { kindNames } from "./models";

const countryStems:Record<string,string>={jospiora:"джоспиор",denlin:"денлин",snowind:"сноувинд",oratris:"оратрис",sudros:"судрос",nocturn:"ноктюрн"};
const explicit:Record<string,string[]>={
  "/news/new-lands-expedition":["/countries/jospiora","/countries/oratris","/races/humans"],
  "/news/new-faces":["/characters/abel-duran","/characters/albert-fon-karma"],
  "/countries/jospiora":["/countries/oratris","/organizations/guardian"],
  "/countries/nocturn":["/organizations/sanguinium","/organizations/dark-hand-church"],
  "/countries/denlin":["/organizations/windcatchers"],
  "/countries/oratris":["/countries/jospiora","/organizations/blood-day"],
};
const raceAliases:Record<string,string>={"Человек":"humans","Эльф":"elves","Дроу":"drow","Дворф":"dwarves","Конструкт":"constructs","Хорд":"hordes","Зверолюд":"beastfolk","Вампир":"vampires","Нежить":"undead","Скайзерновец":"skyzernians"};
export async function relatedPages(path:string){
  const entries=await publicIndex();const nodes=entries.map(a=>({...a,path:`/${a.kind}/${a.slug}`}));
  const current=nodes.find(a=>a.path===path);
  const archive=()=>["countries","characters","organizations","races"].flatMap(kind=>{const a=nodes.find(n=>n.kind===kind&&n.path!==path);return a?[{href:a.path,title:a.title,kind:kindNames[a.kind],reason:"Другие материалы архива"}]:[];});
  if(!current)return archive();
  const currentText=`${current.title} ${current.summary} ${current.body} ${current.country}`.toLowerCase();
  const linked=new Set([...(explicit[path]||[]),...current.related]);
  const relatedCountries=nodes.filter(a=>a.kind==="countries"&&(a.title===current.country||currentText.includes(countryStems[a.slug]||a.title.toLowerCase())));
  const countryNames=new Set(relatedCountries.map(a=>a.title));if(current.kind==="countries")countryNames.add(current.title);
  const characterCountries=current.kind==="countries"?new Set([current.title]):current.country?new Set([current.country]):countryNames;
  const candidates=nodes.filter(a=>a.path!==path).map(a=>{
    let score=0,reason="";
    if(linked.has(a.path)||a.related.includes(path)||(explicit[a.path]||[]).includes(path)){score=100;reason="Связь в мировом архиве";}
    if(a.kind==="countries"&&countryNames.has(a.title)){score=Math.max(score,80);reason=reason||"Связанное государство";}
    if(a.kind==="characters"&&characterCountries.has(a.country)){score=Math.max(score,75);reason=reason||`Страна персонажа: ${a.country}`;}
    if(a.kind==="organizations"&&(a.title===current.organization||relatedCountries.some(c=>a.body.toLowerCase().includes(countryStems[c.slug]||c.title.toLowerCase())))){score=Math.max(score,65);reason=reason||"Организация, связанная со страной";}
    if(a.kind==="races"&&(a.title===current.race||a.slug===raceAliases[current.race])){score=Math.max(score,85);reason="Раса персонажа";}
    if(a.kind==="characters"&&current.kind==="races"&&(a.race===current.title||raceAliases[a.race]===current.slug)){score=Math.max(score,75);reason="Представитель расы";}
    if(a.kind==="characters"&&current.kind==="organizations"&&a.organization===current.title){score=Math.max(score,80);reason="Участник организации";}
    return {a,score,reason,tie:randomInt(100000)};
  }).filter(c=>c.score>0).sort((a,b)=>b.score-a.score||a.tie-b.tie);
  const selected:typeof candidates=[];const types=new Set<string>();
  for(const c of candidates)if(!types.has(c.a.kind)){selected.push(c);types.add(c.a.kind);if(selected.length===4)break;}
  for(const c of candidates)if(selected.length<4&&!selected.includes(c))selected.push(c);
  return selected.length?selected.map(({a,reason})=>({href:a.path,title:a.title,kind:kindNames[a.kind],reason})):archive();
}

