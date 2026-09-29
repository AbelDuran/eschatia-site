import Link from "next/link";
import ThemeToggle from "./theme-toggle";
export default function PortalShell({children,title}:{children:React.ReactNode;title:string}) {
  return <main className="portal-page"><header className="site-header"><Link className="brand" href="/"><span>✦ ESCHATIA</span><small>LA FRONTIER</small></Link><Link href="/library">Поиск</Link><Link href="/world">Архив мира</Link><Link href="/account">Личный кабинет</Link><ThemeToggle/></header><div className="portal-wrap"><p className="section-label">ESCHATIA LA FRONTIER</p><h1>{title}</h1>{children}</div><footer><span>© 2026 ESCHATIA LA FRONTIER</span><Link href="/start">Как начать</Link><Link href="/world">Архив мира</Link></footer></main>;
}

