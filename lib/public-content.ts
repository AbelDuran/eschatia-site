import "server-only";
import { database, databaseConfigured } from "./database";
import { Article, Kind } from "./models";
import legacyCharacters from "../app/data/characters.json";
import raceCatalog from "../app/data/races.json";
import catalog from "../app/data/catalog.json";
import { baseArticles } from "./seed";

export async function articleRecord(kind:Kind,slug:string):Promise<Article|null>{
  if(!databaseConfigured()){
    const base=baseArticles.find(a=>a.kind===kind&&a.slug===slug);
    return base?{...base,id:`legacy:${kind}/${slug}`,status:"published",owner_id:null,version:1,related:[],created_at:"2026-09-04T00:00:00Z",updated_at:"2026-09-04T00:00:00Z"}:null;
  }
  const [article]=await database().query<Article>("SELECT * FROM articles WHERE kind=$1 AND slug=$2",[kind,slug]);
  return article||null;
}
export const visible=(a:Article)=>a.status==="published"||a.status==="frozen";
export type CharacterCard=typeof legacyCharacters[number]&{frozen?:boolean};
export async function homeData(){
  const records=databaseConfigured()?await database().query<Article>("SELECT * FROM articles ORDER BY created_at ASC"):[];
  const byPath=new Map(records.map(a=>[`${a.kind}/${a.slug}`,a]));
  const live=records.filter(visible);
  const characters:CharacterCard[]=legacyCharacters.filter(c=>{const a=byPath.get(`characters/${c.slug}`);return !a||visible(a);}).map(c=>{const a=byPath.get(`characters/${c.slug}`);return a?{...c,name:a.title,shortDescription:a.summary,image:a.image,country:a.country,group:a.organization||"Без организации",race:a.race,frozen:a.status==="frozen"}:c;});
  live.filter(a=>a.kind==="characters"&&!legacyCharacters.some(c=>c.slug===a.slug)).forEach((a,i)=>characters.push({name:a.title,slug:a.slug,shortDescription:a.summary,image:a.image,country:a.country,group:a.organization||"Без организации",race:a.race,role:a.summary,mark:"✦",piece:"Персонаж",corruption:"Не указана",skills:[],createdAt:a.created_at,creationOrder:100+i,application:"",physical:[],personality:[a.body],extracts:[],frozen:a.status==="frozen"}));
  const countries=catalog.countries.filter(c=>{const a=byPath.get(`countries/${c.slug}`);return !a||visible(a);}).map(c=>{const a=byPath.get(`countries/${c.slug}`);return a?{...c,name:a.title,description:a.summary}:c;});
  live.filter(a=>a.kind==="countries"&&!catalog.countries.some(c=>c.slug===a.slug)).forEach(a=>countries.push({name:a.title,slug:a.slug,description:a.summary,kind:"Государство",crest:a.image}));
  const groups=catalog.groups.filter(c=>{const a=byPath.get(`organizations/${c.slug}`);return !a||visible(a);}).map(c=>{const a=byPath.get(`organizations/${c.slug}`);return a?{...c,name:a.title,description:a.summary}:c;});
  live.filter(a=>a.kind==="organizations"&&!catalog.groups.some(c=>c.slug===a.slug)).forEach(a=>groups.push({name:a.title,slug:a.slug,description:a.summary,kind:"Организация",crest:a.image}));
  const races=raceCatalog.filter(c=>{const a=byPath.get(`races/${c.slug}`);return !a||visible(a);}).map(c=>{const a=byPath.get(`races/${c.slug}`);return {name:a?.title||c.name,slug:c.slug,summary:a?.summary||c.summary};});
  live.filter(a=>a.kind==="races"&&!raceCatalog.some(c=>c.slug===a.slug)).forEach(a=>races.push({name:a.title,slug:a.slug,summary:a.summary}));
  const news=[...baseArticles.filter(a=>a.kind==="news"&&!byPath.has(`news/${a.slug}`)),...live.filter(a=>a.kind==="news").reverse()].slice(0,3).map(a=>({slug:a.slug,title:a.title,summary:a.summary,image:a.image}));
  return {characters,countries,groups,raceCatalog:races,news};
}
export type HomeData=Awaited<ReturnType<typeof homeData>>;
export async function publicIndex(){
  const rows=databaseConfigured()?await database().query<Article>("SELECT * FROM articles"):[];
  const keys=new Set(rows.map(a=>`${a.kind}/${a.slug}`));
  return [...baseArticles.filter(a=>!keys.has(`${a.kind}/${a.slug}`)).map(a=>({...a,related:[] as string[]})),...rows.filter(visible)];
}
