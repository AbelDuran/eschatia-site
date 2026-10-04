import {test} from "node:test";
import assert from "node:assert/strict";
import {searchArticles} from "../lib/search";
import {detailsInput} from "../lib/content-details";
import {defaultDetails} from "../lib/content-defaults";
import {baseArticles} from "../lib/seed";
import type {Article} from "../lib/models";
import lore from "../app/data/lore.json";
const entries:Article[]=baseArticles.map(a=>({...a,id:a.slug,status:"published",owner_id:null,version:1,related:[],created_at:"",updated_at:"",details:defaultDetails(a.kind,a.slug)}));
test("public search finds titles, body and structured tags without leaking hidden materials",()=>{
 const secret={...entries[0],slug:"private",title:"Сверхсекретная анкета",status:"draft" as const};
 assert.equal(searchArticles([...entries,secret],"Сверхсекретная").length,0);
 assert(searchArticles(entries,"Джоспиора").some(a=>a.kind==="countries"));
 assert(searchArticles(entries,"Благодетель","lore","religions").length>0);
 assert(searchArticles(entries,"Сумрачноокая").some(a=>a.slug==="selena"));
 assert(searchArticles(entries,"немецкий","lore").some(a=>a.slug==="languages"));
 assert.equal(searchArticles(entries,"невозможный-поиск-123456789").length,0);
});
test("curated metadata fits editor schema and lore links resolve",()=>{
 const paths=new Set(entries.map(a=>`/${a.kind}/${a.slug}`));
 for(const a of entries){const parsed=detailsInput.safeParse(a.details);assert(parsed.success,`${a.slug}: ${JSON.stringify(parsed.error?.issues)}`);}
 for(const a of lore)for(const path of a.related)assert(paths.has(path),`${a.slug}: broken link ${path}`);
 assert.equal(defaultDetails("countries","jospiora").faith,"Церковь Странствий");
 assert.equal(defaultDetails("countries","nocturn").blocks?.length,4);
 assert.match(defaultDetails("countries","oratris").language!,/немецкая/);
 assert.match(defaultDetails("countries","sudros").language!,/китайская/);
 assert.match(defaultDetails("countries","nocturn").language!,/английская/);
});
test("metadata rejects unsafe links and malformed dates",()=>{
 for(const bad of [{ruler:{name:"A",title:"B",body:"C",image:"javascript:alert(1)",href:""}},{faithPath:"//evil.example"},{date:"2026-02-30"},{application:"https://evil.example"}])assert.equal(detailsInput.safeParse(bad).success,false);
});
