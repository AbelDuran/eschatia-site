"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContentFields, readDetails } from "./content-fields";
import { defaultDetails } from "@/lib/content-defaults";
import { Application, Article, CharacterInput, kinds, kindNames, statusNames } from "@/lib/models";

export function MutationForm({action,children,makeData,onSuccess}:{action:string;children:React.ReactNode;makeData:(f:FormData)=>unknown;onSuccess?:(result:Record<string,unknown>)=>void}) {
  const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [failed,setFailed]=useState(false);
  return <form className="portal-form" onSubmit={async e=>{e.preventDefault();if(busy)return;const form=e.currentTarget;setBusy(true);setMessage("");try{const response=await fetch("/api/portal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,data:makeData(new FormData(form))})});const result=await response.json();if(!response.ok)throw new Error(result.error);setFailed(false);setMessage(result.message||"Сохранено");onSuccess?.(result);if(result.logout)router.push("/account");router.refresh();}catch(err){setFailed(true);setMessage(err instanceof Error?err.message:"Ошибка соединения");}finally{setBusy(false);}}}>
    <fieldset disabled={busy}>{children}</fieldset><p role={failed?"alert":"status"} aria-live="polite">{busy?"Сохраняем…":message}</p>
  </form>;
}
export function ActionButton({action,data,children}:{action:string;data?:unknown;children:React.ReactNode}) { return <MutationForm action={action} makeData={()=>data||{}}><button className="button" type="submit">{children}</button></MutationForm>; }
const empty:CharacterInput={title:"",summary:"",body:"",image:"",country:"",organization:"",race:""};
function CharacterFields({data=empty}:{data?:CharacterInput}) { return <>
  <label>Имя / название<input name="title" defaultValue={data.title} required minLength={2} maxLength={120}/></label>
  <label>Краткое описание<textarea name="summary" defaultValue={data.summary} maxLength={600} rows={3}/></label>
  <div className="portal-columns"><label>Страна<input name="country" defaultValue={data.country} maxLength={100}/></label><label>Раса<input name="race" defaultValue={data.race} maxLength={100}/></label><label>Организация<input name="organization" defaultValue={data.organization} maxLength={150}/></label></div>
  <label>Изображение: путь из public или HTTPS-ссылка<input name="image" defaultValue={data.image} maxLength={1000} placeholder="/portrait.png"/></label>
  <label>Текст анкеты / статьи<textarea name="body" defaultValue={data.body} maxLength={60000} rows={18} placeholder="Внешность, характер, биография, способности и ограничения…"/></label>
  <small>Для персонажа удобнее заполнить отдельные поля выше. Здесь можно оставить прежнюю анкету или основной текст статьи. Пустая строка разделяет абзацы; HTML не выполняется.</small>
  </>; }
const readFields=(f:FormData):CharacterInput=>({...empty,...Object.fromEntries(Object.keys(empty).map(k=>[k,String(f.get(k)||"")]))});
export function ApplicationForm({application,character}:{application?:Application;character?:Article}) {
  return <MutationForm action="saveApplication" makeData={f=>({version:application?.version||0,data:{...readFields(f),details:readDetails(f,application?.data.details||{...defaultDetails("characters",character?.slug||""),...character?.details})}})}><ContentFields kind="characters" data={application?.data.details||{...defaultDetails("characters",character?.slug||""),...character?.details}}/><CharacterFields data={application?.data || character}/><button className="button" type="submit">Сохранить черновик</button></MutationForm>;
}
export function CommentForm({id}:{id:string}) {const [key,setKey]=useState(0);return <MutationForm key={key} action="comment" makeData={f=>({id,body:f.get("body")})} onSuccess={()=>setKey(k=>k+1)}><label>Сообщение<textarea name="body" required maxLength={5000} rows={4}/></label><button className="button">Отправить сообщение</button></MutationForm>;}
export function ReviewForm({app}:{app:Application}) {return <MutationForm action="review" makeData={f=>({id:app.id,version:app.version,decision:f.get("decision"),reason:f.get("reason")})}><label>Решение<select name="decision"><option value="changes">Вернуть на исправление</option><option value="approved">Одобрить и опубликовать</option><option value="rejected">Отклонить</option></select></label><label>Обоснование<textarea required minLength={5} maxLength={5000} name="reason"/></label><button className="button">Подтвердить решение</button></MutationForm>;}
export function ArticleEditor({article}:{article?:Article}) {
  const router=useRouter();const [kind,setKind]=useState(article?.kind||"news");const details={...defaultDetails(article?.kind||"news",article?.slug||""),...article?.details};const [preview,setPreview]=useState<CharacterInput|null>(null);
  return <><MutationForm action="saveArticle" makeData={f=>({id:article?.id,version:article?.version||0,data:{...readFields(f),details:readDetails(f,details),kind:f.get("kind"),slug:f.get("slug"),owner_id:f.get("owner_id")||null,related:String(f.get("related")||"").split(/\s+/).filter(Boolean)}})} onSuccess={r=>{if(!article)router.push(`/admin/articles/${r.id}`);}}>
    <label>Тип<select name="kind" value={kind} onChange={e=>setKind(e.target.value as typeof kind)}>{kinds.map(k=><option key={k} value={k}>{kindNames[k]}</option>)}</select></label>
    <label>Адрес (латиница, цифры, дефис)<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} defaultValue={article?.slug} readOnly={Boolean(article)}/></label>
    <ContentFields key={kind} kind={kind} data={details}/><CharacterFields data={article}/>
    <label>Discord ID владельца персонажа (необязательно)<input name="owner_id" pattern="[0-9]{17,20}" defaultValue={article?.owner_id||""}/></label>
    <label>Связанные страницы — по одному адресу в строке<textarea name="related" defaultValue={article?.related.join("\n")} placeholder="/countries/jospiora" rows={3}/></label>
    <div className="portal-actions"><button type="button" className="button" onClick={e=>setPreview(readFields(new FormData(e.currentTarget.form!)))}>Предпросмотр</button><button className="button">{article?"Сохранить изменения":"Создать черновик"}</button></div>
  </MutationForm>{preview&&<section className="portal-panel"><h2>{preview.title}</h2><p>{preview.summary}</p>{preview.body.split(/\n\s*\n/).map((p,i)=><p className="prose-text" key={i}>{p}</p>)}</section>}</>;
}
export function ArticleStatus({article}:{article:Article}) {return <section className="portal-panel"><h2>Публикация</h2><p>Статус: {statusNames[article.status]}. Версия {article.version}.</p><Link href={`/${article.kind}/${article.slug}`}>Открыть публичную страницу ↗</Link><div className="portal-actions">
  {article.status!=="published"&&<ActionButton action="articleStatus" data={{id:article.id,version:article.version,status:"published"}}>Опубликовать / восстановить</ActionButton>}
  {article.kind==="characters"&&article.status==="published"&&<ActionButton action="articleStatus" data={{id:article.id,version:article.version,status:"frozen"}}>❄ Заморозить</ActionButton>}
  {article.status!=="draft"&&article.status!=="deleted"&&<ActionButton action="articleStatus" data={{id:article.id,version:article.version,status:"draft"}}>Снять с публикации</ActionButton>}
  </div>{article.status!=="deleted"&&<details><summary>Удалить материал</summary><p>Материал исчезнет с сайта. История останется доступной администрации для восстановления.</p><MutationForm action="articleStatus" makeData={f=>({id:article.id,version:article.version,status:"deleted",confirmation:f.get("confirmation")})}><label>Введите название «{article.title}»<input name="confirmation" required/></label><button className="button">Удалить с сайта</button></MutationForm></details>}</section>;}
export function SettingsForm({name,settings}:{name:string;settings:Record<string,unknown>}) {return <MutationForm action="settings" makeData={f=>({name:f.get("name"),notifications:f.get("notifications")==="on",showDiscord:f.get("showDiscord")==="on"})}><label>Имя на сайте<input name="name" required minLength={2} maxLength={80} defaultValue={name}/></label><label className="check-label"><input type="checkbox" name="notifications" defaultChecked={settings.notifications!==false}/>Уведомлять о рассмотрении и новых сообщениях</label><label className="check-label"><input type="checkbox" name="showDiscord" defaultChecked={settings.showDiscord===true}/>Показывать имя Discord рядом с моей анкетой</label><button className="button">Сохранить настройки</button></MutationForm>;}
export function RoleForm({users}:{users:{id:string;name:string;role:string}[]}) {return <MutationForm action="role" makeData={f=>({id:f.get("id"),role:f.get("role"),reason:f.get("reason")})}><label>Пользователь<select name="id" required><option value="">Выберите человека</option>{users.map(u=><option key={u.id} value={u.id}>{u.name} — {u.id} ({u.role})</option>)}</select></label><label>Роль<select name="role"><option value="admin">Администратор</option><option value="player">Участник</option></select></label><label>Причина<input name="reason" required minLength={5} maxLength={500}/></label><button className="button">Изменить права</button></MutationForm>;}
