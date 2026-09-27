"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ArticleNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [scroll, setScroll] = useState({ visible: false, progress: 0 });
  const isArticle = /^\/(countries|characters|organizations|races)\//.test(pathname) || pathname === "/world";

  useEffect(() => {
    const update = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      setScroll({ visible: window.scrollY > 180, progress: distance > 0 ? Math.min(100, window.scrollY / distance * 100) : 0 });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  if (!isArticle || !scroll.visible) return null;
  return (
    <button className="article-back" type="button" onClick={() => window.history.length > 1 ? router.back() : router.push("/")} aria-label="Вернуться на предыдущую страницу">
      <span>← Назад</span>
      <span className="article-back-track" aria-hidden="true"><span style={{ width: `${scroll.progress}%` }} /></span>
    </button>
  );
}
