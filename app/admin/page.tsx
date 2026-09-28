/* eslint-disable @next/next/no-html-link-for-pages -- OAuth confirmation requires a full redirect through Discord. */
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { database } from "@/lib/database";
import { Application, Article, kindNames, requireStaff, statusNames } from "@/lib/models";
import PortalShell from "@/app/components/portal-shell";
import { RoleForm } from "@/app/components/portal-forms";

export default async function AdminPage() {
  const user=await requireUser();requireStaff(user);const db=database();
  const [articles,applications,users,audits]=await Promise.all([
    db.query<Article>("SELECT * FROM articles ORDER BY updated_at DESC LIMIT 300"),
    db.query<Application&{name:string}>("SELECT a.*,u.name FROM applications a JOIN users u ON u.id=a.owner_id WHERE submitted_at IS NOT NULL ORDER BY updated_at DESC LIMIT 100"),
    user.role==="owner"?db.query<{id:string;name:string;role:string}>("SELECT id,name,role FROM users WHERE id<>$1 ORDER BY name",[user.id]):Promise.resolve([]),
    db.query<{id:string;name:string;action:string;target:string;created_at:string}>("SELECT a.*,u.name FROM audit a JOIN users u ON u.id=a.actor_id ORDER BY a.created_at DESC LIMIT 50")]);
  return <PortalShell title="Управление сайтом"><div className="portal-actions"><Link className="button" href="/admin/articles/new">+ Новый материал</Link><Link href="/account">Мой кабинет</Link></div>
  <section className="portal-panel"><h2>Анкеты и обсуждения</h2>{applications.length?applications.map(a=><p key={a.id}><Link href={`/account/applications/${a.id}`}>{a.data.title} — {a.name}</Link> · {statusNames[a.status]}</p>):<p>Отправленных анкет пока нет.</p>}</section>
  <section className="portal-panel"><h2>Материалы</h2><p>Новости, страны, расы, организации, персонажи и статьи мирового архива. Последние 300 материалов.</p>{articles.map(a=><div className="admin-row" key={a.id}><Link href={`/admin/articles/${a.id}`}>{a.title}</Link><span>{kindNames[a.kind]} · {statusNames[a.status]}</span></div>)}</section>
  {user.role==="owner"&&<section className="portal-panel"><h2>Команда проекта</h2><p>Выберите человека по точному Discord ID. Перед изменением прав <a href="/auth/discord">повторно войдите через Discord</a>. Все сеансы получателя будут завершены.</p><RoleForm users={users}/></section>}
  <details className="portal-panel"><summary>Журнал действий — последние 50 записей</summary>{audits.map(a=><p key={a.id}>{new Date(a.created_at).toLocaleString("ru-RU")} · {a.name} · {a.action} · {a.target}</p>)}</details></PortalShell>;
}

