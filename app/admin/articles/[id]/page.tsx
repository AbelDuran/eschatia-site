import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { database } from "@/lib/database";
import { Article, requireStaff } from "@/lib/models";
import PortalShell from "@/app/components/portal-shell";
import { ArticleEditor, ArticleStatus } from "@/app/components/portal-forms";
import { enrichArticle } from "@/lib/public-content";
import DetailsPreview from "@/app/components/details-preview";
import Link from "next/link";
export default async function EditArticlePage({params}:{params:Promise<{id:string}>}) {
  requireStaff(await requireUser());const {id}=await params;
  if(id==="new")return <PortalShell title="Новый материал"><Link href="/admin">← Управление</Link><ArticleEditor/></PortalShell>;
  if(!/^[a-f0-9-]{36}$/i.test(id))notFound();
  const [article]=await database().query<Article>("SELECT * FROM articles WHERE id=$1",[id]);if(!article)notFound();
  const history=await database().query<{id:string;snapshot:Article;created_at:string}>("SELECT * FROM revisions WHERE article_id=$1 ORDER BY created_at DESC LIMIT 20",[id]);
  return <PortalShell title={article.title}><Link href="/admin">← Управление</Link><ArticleStatus key={`status-${article.version}`} article={enrichArticle(article)}/>{article.status!=="deleted"&&<ArticleEditor key={article.version} article={article}/>}<details className="portal-panel"><summary>Предыдущие версии</summary>{history.map(h=><details key={h.id}><summary>Версия {h.snapshot.version} — {new Date(h.created_at).toLocaleString("ru-RU")}</summary><p>{h.snapshot.title}</p><DetailsPreview details={h.snapshot.details}/><p className="prose-text">{h.snapshot.body}</p><small>Для восстановления текста скопируйте нужную версию в редактор.</small></details>)}</details></PortalShell>;
}
