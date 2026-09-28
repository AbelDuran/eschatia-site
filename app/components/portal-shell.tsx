import Link from "next/link";
import ThemeToggle from "./theme-toggle";
export default function PortalShell({children,title}:{children:React.ReactNode;title:string}) {
  return <main className="portal-page"><header className="site-header"><Link className="brand" href="/">✦ ESCHATIA</Link><Link href="/account">Личный кабинет</Link><ThemeToggle/></header><div className="portal-wrap"><p className="section-label">АРХИВ / ЛИЧНОЕ ДЕЛО</p><h1>{title}</h1>{children}</div></main>;
}

