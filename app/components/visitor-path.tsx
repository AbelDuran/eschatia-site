"use client";
import {useEffect,useRef,useSyncExternalStore} from "react";
import Link from "next/link";
type Mode="new"|"returning";
const subscribe=(notify:()=>void)=>{window.addEventListener("storage",notify);window.addEventListener("visitor-change",notify);return ()=>{window.removeEventListener("storage",notify);window.removeEventListener("visitor-change",notify);};};
const snapshot=()=>{try{return localStorage.getItem("eschatia-visitor");}catch{return null;}};
export default function VisitorPath(){
 const mode=useSyncExternalStore(subscribe,snapshot,()=>null);const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(mode==="new"||mode==="returning"){document.documentElement.dataset.visitor=mode;dialog.current?.close();}else dialog.current?.showModal();},[mode]);
 function choose(value:Mode){try{localStorage.setItem("eschatia-visitor",value);}catch{}document.documentElement.dataset.visitor=value;window.dispatchEvent(new Event("visitor-change"));dialog.current?.close();trigger.current?.focus();}
 return <section className="visitor-path" aria-label="Ваш путь в Эсхатии">
 <div><p className="section-label">{mode==="returning"?"СНОВА В АРХИВЕ":"ДОБРО ПОЖАЛОВАТЬ В ESCHATIA LA FRONTIER"}</p>{mode==="returning"?<h1>Что изменилось в мире?</h1>:<h2>Впервые здесь? Начните с главного.</h2>}<p>{mode==="returning"?"Свежие сводки, новые имена и материалы — всё рядом.":"Текстовая ролевая игра: познакомьтесь с миром, создайте персонажа и присоединитесь к истории."}</p></div>
 <nav className="portal-actions" aria-label="Рекомендованные разделы">{mode==="returning"?<><a href="#news">Последние сводки</a><Link href="/library?sort=updated">Новые материалы</Link><a href="#characters">Персонажи</a><Link href="/library?category=rules">Механики</Link></>:<Link className="button" href="/start">Как начать играть →</Link>}<Link href="/library">Перейти в архив</Link><button ref={trigger} type="button" onClick={()=>dialog.current?.showModal()}>Изменить мой маршрут</button></nav>
 <dialog ref={dialog} className="visitor-dialog" aria-labelledby="visitor-title"><h2 id="visitor-title">Добро пожаловать в ESCHATIA LA FRONTIER</h2><p>Как вам удобнее знакомиться с миром?</p><div className="portal-actions"><button className="button" onClick={()=>choose("new")}>Я здесь впервые</button><button className="button" onClick={()=>choose("returning")}>Я уже знаком с ESCHATIA</button></div><p>Выбор сохраняется в этом браузере. Его можно изменить в любое время.</p><button onClick={()=>choose("returning")}>Пропустить знакомство</button></dialog>
 </section>;
}
