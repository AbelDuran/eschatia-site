/* eslint-disable @next/next/no-html-link-for-pages -- OAuth routes require document navigation, not RSC prefetch. */
import Link from "next/link";
import { authConfigured, currentUser } from "@/lib/auth";
import { database } from "@/lib/database";
import { Application, Article, statusNames } from "@/lib/models";
import PortalShell from "@/app/components/portal-shell";
import { ActionButton, ApplicationForm, SettingsForm } from "@/app/components/portal-forms";

export default async function AccountPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const user=await currentUser();const {error}=await searchParams;
  if(!user) return <PortalShell title="Личный кабинет"><section className="portal-panel"><h2>Ваша история в Эсхатии</h2><p>Один Discord-аккаунт — один персонаж. Здесь вы сможете подготовить анкету и обсудить её с администрацией.</p>{error&&<p role="alert">{error==="setup"?"Вход пока не подключён.":"Вход не завершён. Попробуйте ещё раз."}</p>}{authConfigured()?<a className="button" href="/auth/discord">Войти через Discord ↗</a>:<p className="portal-notice">Кабинет готовится к открытию. Вход через Discord появится после подключения сервера.</p>}<p>Мы получаем идентификатор, имя и аватар Discord. Пароли Discord сайт не получает. Анкета до одобрения и её обсуждение доступны только вам и администрации.</p></section></PortalShell>;
  const db=database();
  const [[application],[character],notifications,sessions]=await Promise.all([
    db.query<Application>("SELECT * FROM applications WHERE owner_id=$1",[user.id]),
    db.query<Article>("SELECT * FROM articles WHERE owner_id=$1 AND kind='characters' AND status<>'deleted'",[user.id]),
    db.query<{id:string;message:string;href:string;read_at:string|null}>("SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30",[user.id]),
    db.query<{token_hash:string;device:string;created_at:string;expires_at:string}>("SELECT token_hash,device,created_at,expires_at FROM sessions WHERE user_id=$1 AND expires_at>now() ORDER BY created_at DESC",[user.id])]);
  return <PortalShell title={`Здравствуйте, ${user.name}`}><div className="portal-actions"><span className="status-badge">{user.role==="owner"?"Владелец":user.role==="admin"?"Администратор":"Участник"}</span>{user.role!=="player"&&<Link className="button" href="/admin">Управление сайтом →</Link>}<ActionButton action="logout">Выйти</ActionButton></div>
    <section className="portal-panel"><h2>Мой персонаж</h2>{character?<p><Link href={`/characters/${character.slug}`}>{character.title} ↗</Link> · {statusNames[character.status]}</p>:<p>Опубликованного персонажа пока нет. Если ваша анкета уже есть на сайте, попросите администратора привязать её к вашему Discord ID: <strong>{user.id}</strong>.</p>}
    {application&&<p>Анкета: {statusNames[application.status]} {application.submitted_at&&<Link href={`/account/applications/${application.id}`}>Обсуждение →</Link>}</p>}
    {application?.status!=="submitted"&&character?.status!=="frozen"?<details open={!application&&!character}><summary>{application||character?"Редактировать черновик / предложить изменения":"Заполнить анкету"}</summary><ApplicationForm key={application?.version||character?.version||0} application={application} character={character}/></details>:<p>{character?.status==="frozen"?"Редактирование заморожено администрацией.":"Анкета рассматривается. Дополнения можно обсудить в теме."}</p>}
    {application&&character?.status!=="frozen"&&["draft","changes","rejected"].includes(application.status)&&<ActionButton action="submitApplication" data={{id:application.id,version:application.version}}>Отправить на рассмотрение</ActionButton>}</section>
    <section className="portal-panel"><h2>Уведомления</h2>{notifications.length?notifications.map(n=><p key={n.id}><Link href={n.href}>{!n.read_at?"● ":""}{n.message}</Link></p>):<p>Новых событий пока нет.</p>}{notifications.some(n=>!n.read_at)&&<ActionButton action="readNotifications">Отметить прочитанными</ActionButton>}</section>
    <section className="portal-panel"><h2>Настройки</h2><p>Discord ID: {user.id}. Для обновления аватара и имени Discord <a href="/auth/discord">войдите повторно</a>. Оформление и музыка переключаются кнопками сайта.</p><SettingsForm name={user.name} settings={user.settings}/></section>
    <section className="portal-panel"><h2>Активные сеансы</h2>{sessions.map(s=><div className="session-row" key={s.token_hash}><p>{s.device}<br/><small>Вход: {new Date(s.created_at).toLocaleString("ru-RU")}</small></p><ActionButton action="revokeSession" data={{token_hash:s.token_hash}}>Завершить</ActionButton></div>)}<ActionButton action="logoutAll">Выйти со всех устройств</ActionButton></section>
    <p>Перенос Discord, замена персонажа и удаление учётной записи — через владельца проекта. Единственный способ входа нельзя отвязать самостоятельно.</p>
  </PortalShell>;
}

