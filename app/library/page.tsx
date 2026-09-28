import Link from "next/link";
import { publicIndex } from "@/lib/public-content";
import { kindNames } from "@/lib/models";
import PortalShell from "@/app/components/portal-shell";
export const dynamic="force-dynamic";
export default async function Library({searchParams}:{searchParams:Promise<{kind?:string}>}){const {kind}=await searchParams;const entries=(await publicIndex()).filter(a=>!kind||a.kind===kind);return <PortalShell title={kindNames[kind||""]||"Архив материалов"}><nav className="portal-actions"><Link href="/library">Все</Link>{Object.entries(kindNames).map(([k,n])=><Link key={k} href={`/library?kind=${k}`}>{n}</Link>)}</nav><div className="related-grid">{entries.map(a=><Link className="related-card" href={`/${a.kind}/${a.slug}`} key={`${a.kind}/${a.slug}`}><small>{kindNames[a.kind]}</small><h2>{a.title}</h2><p>{a.summary}</p></Link>)}</div>{!entries.length&&<p>Публикаций пока нет.</p>}</PortalShell>;}

