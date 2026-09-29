import characters from "../app/data/characters.json";
import races from "../app/data/races.json";
import catalog from "../app/data/catalog.json";
import type { Database } from "./database";
import type { Kind } from "./models";
import { defaultDetails } from "./content-defaults";
import lore from "../app/data/lore.json";

export const baseArticles = [
  ...lore.map(a=>({kind:"lore" as Kind,slug:a.slug,title:a.title,summary:a.summary,body:a.body,image:"",country:"",organization:"",race:"",order:0})),
  ...[
    {slug:"new-lands-expedition",title:"Экспедиция в Новые Земли",summary:"Запись открыта.",image:"/news-1.png",body:"За границами старого света Скверна дышит в руинах, а экспедиция уходит туда, откуда никто не возвращался прежним.\n\nПрисоединиться к серверу и узнать об участии можно через Discord: https://discord.gg/dpGsTrewME"},
    {slug:"nocturn-archive",title:"Архив Ноктюрна пополнен",summary:"Обновление архива государства.",image:"/news-2.png",body:"В архиве Ноктюрна собраны сведения о государстве и четырёх силах, поддерживающих его шаткий порядок. Подробнее — на странице Ноктюрна."},
    {slug:"new-faces",title:"Шесть новых лиц в хронике",summary:"Персонажи сервера в хронике Эсхатии.",image:"/news-3.png",body:"В хронике опубликованы одобренные истории персонажей сервера. Анкеты доступны в разделе «Персонажи» на главной странице."},
  ].map((n,i)=>({...n,kind:"news" as Kind,country:"",organization:"",race:"",order:10-i})),
  ...characters.map(c=>({kind:"characters" as Kind,slug:c.slug,title:c.name,summary:c.shortDescription,image:c.image,country:c.country,organization:c.group,race:c.race,body:["Физические данные",...c.physical.map(([k,v])=>`${k}: ${v}`),"Характер",...c.personality,"Биография",...c.extracts].join("\n\n"),order:c.creationOrder})),
  ...races.map(r=>({kind:"races" as Kind,slug:r.slug,title:r.name,summary:r.summary,image:r.image||"",country:"",organization:"",race:r.name,body:r.sections.map(s=>`${s.title}\n\n${s.paragraphs.join("\n\n")}`).join("\n\n"),order:0})),
  ...Object.entries(catalog.countryDetails).map(([slug,c])=>({kind:"countries" as Kind,slug,title:c.name,summary:c.description,image:c.heroImage||"",country:c.name,organization:"",race:"",body:Object.entries(c).filter(([key,v])=>typeof v==="string"&&!/Image|crest|name|kind/.test(key)).map(([,v])=>v).join("\n\n")+"\n\n"+c.features.join("\n\n"),order:0})),
  ...Object.entries(catalog.organizationDetails).map(([slug,o])=>({kind:"organizations" as Kind,slug,title:o.name,summary:o.description,image:o.crest||"",country:"",organization:o.name,race:"",body:Object.entries(o).filter(([key,v])=>typeof v==="string"&&!/crest|name|kind/.test(key)).map(([,v])=>v).join("\n\n"),order:0})),
];
export async function seed(db:Database){
  for(const a of baseArticles) await db.query(`INSERT INTO articles(kind,slug,title,summary,body,image,country,organization,race,status,created_at,details,related) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'published',$10,$11::text::jsonb,$12::text::jsonb) ON CONFLICT(kind,slug) DO NOTHING`,[a.kind,a.slug,a.title,a.summary||"",a.body,a.image,a.country,a.organization,a.race,new Date(Date.UTC(2026,8,4,0,a.order)).toISOString(),JSON.stringify(defaultDetails(a.kind,a.slug)),JSON.stringify(a.kind==="lore"?lore.find(l=>l.slug===a.slug)?.related||[]:[])]);
}

