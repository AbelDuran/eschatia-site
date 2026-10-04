"use client";
import { useState } from "react";
import { archiveCategories, newsTypes, type ContentDetails } from "@/lib/content-details";

export function ContentFields({kind,data={}}:{kind:string;data?:ContentDetails}) {
  const [blocks,setBlocks]=useState(data.blocks||[]);
  const short=(key:keyof ContentDetails,label:string)=><label key={key}>{label}<input name={`d.${key}`} defaultValue={String(data[key]||"")} maxLength={200}/></label>;
  const long=(key:keyof ContentDetails,label:string)=><label key={key}>{label}<textarea name={`d.${key}`} defaultValue={String(data[key]||"")} rows={5} maxLength={20000}/></label>;
  return <details className="editor-details" open><summary>Поля {kind==="characters"?"персонажа":kind==="countries"?"государства":"материала"}</summary>
    <label>Теги, через запятую<input name="d.tags" defaultValue={data.tags?.join(", ")} maxLength={2000}/></label>
    {kind==="characters"&&<>
      <div className="portal-columns">{short("nickname","Прозвище")}{short("role","Роль / занятие")}{short("age","Возраст")}{short("sector","Сектор / фигура")}{short("estate","Сословие / социальный статус")}</div>
      <label>Языки, через запятую<input name="d.languages" defaultValue={data.languages?.join(", ")}/></label>
      <label>Полная анкета в Discord<input name="d.application" type="url" defaultValue={data.application} placeholder="https://discord.com/channels/…"/></label>
      <label>Физические данные — «название: значение» на каждой строке<textarea name="d.physical" defaultValue={data.physical?.map(p=>`${p.label}: ${p.value}`).join("\n")} rows={5}/></label>
      {long("personality","Характер и моральные ценности")}{long("features","Особенности")}{long("abilities","Навыки, способности и заклинания")}{long("biography","Биография")}{long("extra","Цели, инвентарь и дополнительная информация")}
      <p className="field-hint">Пустые разделы используют текст анкеты ниже, если в нём есть соответствующие заголовки.</p>
    </>}
    {kind==="news"&&<div className="portal-columns"><label>Дата новости<input type="date" name="d.date" defaultValue={data.date||new Date().toISOString().slice(0,10)}/></label><label>Тип новости<select name="d.newsType" defaultValue={data.newsType||"Другое"}>{newsTypes.map(t=><option key={t}>{t}</option>)}</select></label></div>}
    {kind==="lore"&&<label>Раздел архива<select name="d.category" defaultValue={data.category||"terms"}>{Object.entries(archiveCategories).map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label>}
    {kind==="countries"&&<>
      {short("language","Язык и лингвистическая основа")}{short("faith","Господствующая вера")}{short("faithPath","Страница веры — /lore/…")}
      <fieldset><legend>Правитель</legend>{["name","title","image","body","href"].map((key,i)=><label key={key}>{["Имя","Титул","Изображение правителя","Краткое описание","Ссылка на статью — /lore/…"][i]}<input name={`r.${key}`} defaultValue={data.ruler?.[key as keyof NonNullable<ContentDetails['ruler']>]||""}/></label>)}</fieldset>
      </>}
    {["countries","lore","organizations","races","news"].includes(kind)&&<>
      <h3>Разделы материала</h3>{kind==="lore"&&<button type="button" onClick={()=>setBlocks([...blocks,...["Что это?","Как работает?","Что может игрок?","Ограничения"].map(title=>({title,type:"mechanic",body:""}))].slice(0,30))}>Добавить структуру механики</button>}<input type="hidden" name="blockCount" value={blocks.length}/>
      {blocks.map((b,i)=><fieldset className="content-block-editor" key={i}><legend>Блок {i+1}</legend><label>Название<input name={`b.${i}.title`} required value={b.title} onChange={e=>setBlocks(blocks.map((v,j)=>j===i?{...v,title:e.target.value}:v))}/></label><label>Тип: культура, религия, место…<input name={`b.${i}.type`} value={b.type} onChange={e=>setBlocks(blocks.map((v,j)=>j===i?{...v,type:e.target.value}:v))}/></label><label>Содержание<textarea name={`b.${i}.body`} rows={6} value={b.body} onChange={e=>setBlocks(blocks.map((v,j)=>j===i?{...v,body:e.target.value}:v))}/></label><div className="portal-actions"><button type="button" onClick={()=>setBlocks(blocks.filter((_,j)=>j!==i))}>Убрать блок</button>{i>0&&<button type="button" onClick={()=>{const next=[...blocks];[next[i-1],next[i]]=[next[i],next[i-1]];setBlocks(next);}}>↑ Выше</button>}</div></fieldset>)}
      <button type="button" className="button" disabled={blocks.length>=30} onClick={()=>setBlocks([...blocks,{title:"",type:"",body:""}])}>Добавить блок</button>
    </>}
  </details>;
}
export function readDetails(f:FormData,previous:ContentDetails={}):ContentDetails {
  const data:Record<string,unknown>={...previous};
  for(const [key,value] of f.entries())if(key.startsWith("d."))data[key.slice(2)]=String(value).trim();
  for(const key of ["tags","languages"])if(f.has(`d.${key}`))data[key]=String(f.get(`d.${key}`)||"").split(",").map(s=>s.trim()).filter(Boolean);
  if(f.has("d.physical"))data.physical=String(f.get("d.physical")||"").split("\n").filter(s=>s.trim()).map(s=>{const i=s.indexOf(":");return {label:i<0?"Описание":s.slice(0,i).trim(),value:i<0?s.trim():s.slice(i+1).trim()};});
  if(f.has("r.name"))data.ruler=Object.fromEntries(["name","title","image","body","href"].map(k=>[k,String(f.get(`r.${k}`)||"").trim()]));
  if(f.has("blockCount"))data.blocks=Array.from({length:Math.min(30,Number(f.get("blockCount")))},(_,i)=>Object.fromEntries(["title","type","body"].map(k=>[k,String(f.get(`b.${i}.${k}`)||"").trim()])));
  return data as ContentDetails;
}
