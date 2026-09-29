import Link from "next/link";
import { publicIndex } from "@/lib/public-content";
import { Article, kindNames } from "@/lib/models";
export default async function EntityLinks({article}:{article:Article}) {
  const paths=new Set(article.related);
  if(article.details?.faithPath)paths.add(article.details.faithPath);
  if(article.details?.ruler?.href)paths.add(article.details.ruler.href);
  const entries=(await publicIndex()).filter(a=>`/${a.kind}/${a.slug}`!==`/${article.kind}/${article.slug}`&&(paths.has(`/${a.kind}/${a.slug}`)||a.kind==="countries"&&a.title===article.country||a.kind==="organizations"&&a.title===article.organization||a.kind==="races"&&(a.title===article.race||a.slug==="humans"&&article.race==="Человек")));
  if(!entries.length)return null;
  return <nav className="entity-links" aria-label="Связи материала">{entries.map(a=><Link key={`${a.kind}/${a.slug}`} href={`/${a.kind}/${a.slug}`}><small>{kindNames[a.kind]}</small>{a.title} ↗</Link>)}</nav>;
}
