"use client";
import { useEffect,useRef,useState } from "react";
import Link from "next/link";

export default function SiteAudio(){
  const audio=useRef<HTMLAudioElement>(null);const [playing,setPlaying]=useState(false);const [volume,setVolume]=useState(.25);const [error,setError]=useState("");
  useEffect(()=>{const element=audio.current!;let enabled=false;try{const saved=Number(localStorage.getItem("eschatia-volume")??.25);element.volume=Math.min(1,Math.max(0,Number.isFinite(saved)?saved:.25));enabled=localStorage.getItem("eschatia-audio")==="on";}catch{}setVolume(element.volume);
    const resume=()=>{try{enabled=localStorage.getItem("eschatia-audio")==="on";}catch{}if(enabled&&element.paused)void element.play().catch(()=>{});};
    resume();document.addEventListener("pointerdown",resume,{once:true});document.addEventListener("keydown",resume,{once:true});
    return()=>{document.removeEventListener("pointerdown",resume);document.removeEventListener("keydown",resume);};
  },[]);
  async function toggle(){const element=audio.current!;setError("");if(!element.paused){element.pause();try{localStorage.setItem("eschatia-audio","off");}catch{}return;}try{await element.play();try{localStorage.setItem("eschatia-audio","on");}catch{}}catch{setError("Не удалось включить музыку. Повторите нажатие.");}}
  return <div className="site-tools"><audio ref={audio} src="/audio/empty-city.ogg" loop preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError("Музыка недоступна в этом браузере.");}}/><Link href="/account" className="tools-account">Кабинет</Link><Link href="/library" aria-label="Поиск по сайту">Поиск</Link><button type="button" onClick={toggle} aria-pressed={playing} aria-label={playing?"Выключить музыку":"Включить музыку"}>{playing?"♫ Выкл.":"♫ Музыка"}</button><details><summary aria-label="Настройки звука">⚙</summary><div className="audio-popover"><label>Громкость<input type="range" min="0" max="1" step="0.05" value={volume} onChange={e=>{const value=Number(e.target.value);audio.current!.volume=value;setVolume(value);try{localStorage.setItem("eschatia-volume",String(value));}catch{}}}/></label><p>EmptyCity — yd</p><a href="https://opengameart.org/content/emptycity-background-music" target="_blank" rel="noreferrer">Источник · CC0</a></div></details>{error&&<p role="status" className="audio-error">{error}</p>}</div>;
}

