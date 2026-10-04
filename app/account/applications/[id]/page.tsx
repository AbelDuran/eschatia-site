import DetailsPreview from "@/app/components/details-preview";
import type { CharacterInput } from "@/lib/models";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { database } from "@/lib/database";
import { loadApplication } from "@/lib/portal-service";
import { DomainError, statusNames } from "@/lib/models";
import PortalShell from "@/app/components/portal-shell";
import { CommentForm, ReviewForm } from "@/app/components/portal-forms";

export default async function DiscussionPage({params}:{params:Promise<{id:string}>}) {
  const user=await currentUser();if(!user)redirect("/account");
  const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))notFound();
  const db=database();let app;
  try {app=await loadApplication(db,user,id);}catch(error){if(error instanceof DomainError)notFound();throw error;}
  if(!app.submitted_at)notFound();
  const comments=await db.query<{id:string;name:string;body:string;created_at:string}>("SELECT c.id,u.name,c.body,c.created_at FROM comments c JOIN users u ON u.id=c.author_id WHERE application_id=$1 ORDER BY c.created_at DESC LIMIT 200",[id]);
  const versions=await db.query<{id:string;data:CharacterInput;created_at:string}>("SELECT * FROM application_versions WHERE application_id=$1 ORDER BY created_at DESC LIMIT 20",[id]);
  return <PortalShell title={app.data.title}><p><Link href={user.role==="player"?"/account":"/admin"}>← Вернуться</Link> · {statusNames[app.status]}</p><p className="portal-notice">Закрытое обсуждение: только автор анкеты, администраторы и владелец.</p><section className="portal-panel"><h2>Текущая версия анкеты</h2><p>{app.data.country} / {app.data.race} / {app.data.organization}</p><p>{app.data.summary}</p><DetailsPreview details={app.data.details}/><p className="prose-text">{app.data.body}</p></section>{user.role!=="player"&&app.status==="submitted"&&<section className="portal-panel"><h2>Рассмотрение</h2><ReviewForm app={app}/></section>}
  <section className="portal-panel"><h2>Обсуждение</h2><p>Последние 200 сообщений. Обновите страницу, чтобы увидеть новые ответы.</p>{comments.reverse().map(c=><article className="discussion-message" key={c.id}><strong>{c.name}</strong><time>{new Date(c.created_at).toLocaleString("ru-RU")}</time><p className="prose-text">{c.body}</p></article>)}{!comments.length&&<p>Начните обсуждение анкеты.</p>}<CommentForm id={id}/></section>
  <details className="portal-panel"><summary>История отправленных версий</summary>{versions.map(v=><details key={v.id}><summary>{v.data.title} — {new Date(v.created_at).toLocaleString("ru-RU")}</summary><DetailsPreview details={v.data.details}/><p className="prose-text">{v.data.body}</p></details>)}</details></PortalShell>;
}

