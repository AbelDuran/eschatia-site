import { Article, kindNames } from "./models";
import { archiveCategories } from "./content-details";
const normalize=(v:string)=>v.toLocaleLowerCase("ru").replaceAll("ё","е");
export function searchArticles(entries:Article[],query:string,kind="",category="",sort="relevance",newsType="") {
 const words=normalize(query.trim()).split(/\s+/).filter(Boolean);
 return entries.filter(a=>a.status==="published"||a.status==="frozen").filter(a=>(!kind||a.kind===kind)&&(!category||a.details?.category===category)&&(!newsType||a.kind==="news"&&a.details?.newsType===newsType)).map(a=>{
 const title=normalize(a.title);const content=normalize([a.title,a.summary,a.body,a.country,a.organization,a.race,kindNames[a.kind],archiveCategories[a.details?.category||""],JSON.stringify(a.details||{})].join(" "));
 return {a,match:words.every(w=>content.includes(w)),score:words.reduce((n,w)=>n+(title.includes(w)?10:1),0)};
 }).filter(r=>r.match).sort((a,b)=>{const time=(v:string)=>Date.parse(v)||0;const order=sort==="updated"?time(b.a.updated_at)-time(a.a.updated_at):sort==="newest"?time(b.a.details?.date||b.a.created_at)-time(a.a.details?.date||a.a.created_at):sort==="oldest"?time(a.a.details?.date||a.a.created_at)-time(b.a.details?.date||b.a.created_at):sort==="title"?0:b.score-a.score;return order||a.a.title.localeCompare(b.a.title,"ru");}).map(r=>r.a);
}
