import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Database } from "./database";
import { Actor, Application, Article, articleInput, characterInput, DomainError, requireOwner, requireStaff } from "./models";

// JSON payloads are serialized once; the text cast prevents postgres.js from encoding the string again.
const uuid = z.string().uuid();
async function audit(db: Database, actor: Actor, action: string, target: string, details = {}) {
  await db.query("INSERT INTO audit(actor_id,action,target,details) VALUES($1,$2,$3,$4::text::jsonb)", [actor.id, action, target, JSON.stringify(details)]);
}
async function notify(db: Database, user: string, message: string, href: string) {
  await db.query(`INSERT INTO notifications(user_id,message,href) SELECT id,$2,$3 FROM users WHERE id=$1 AND COALESCE((settings->>'notifications')::boolean,true)`, [user, message, href]);
}
export async function loadApplication(db: Database, actor: Actor, id: string, lock = false) {
  uuid.parse(id);
  const [app] = await db.query<Application>(`SELECT * FROM applications WHERE id=$1 ${lock ? "FOR UPDATE" : ""}`, [id]);
  if (!app || (actor.role === "player" && app.owner_id !== actor.id)) throw new DomainError("Анкета не найдена.", 404);
  if (actor.role !== "player" && app.owner_id !== actor.id && !app.submitted_at) throw new DomainError("Черновик ещё не отправлен.", 404);
  return app;
}
export async function rateLimit(db: Database, key: string, max = 60) {
  const [row] = await db.query<{ hits: number }>(`INSERT INTO rate_limits(key,hits,reset_at) VALUES($1,1,now()+interval '1 minute') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_limits.reset_at<now() THEN 1 ELSE rate_limits.hits+1 END, reset_at=CASE WHEN rate_limits.reset_at<now() THEN now()+interval '1 minute' ELSE rate_limits.reset_at END RETURNING hits`, [key]);
  if (row.hits>max) throw new DomainError("Слишком много запросов. Подождите минуту.", 429);
}
export async function mutate(db: Database, actor: Actor, input: unknown) {
  const command = z.object({ action: z.string(), data: z.unknown() }).parse(input);
  await rateLimit(db, `mutation:${actor.id}`);
  return db.transaction(async tx => {
    // Lock the user too: concurrent draft creation and staff assignment serialize.
    const [storedActor]=await tx.query<{role:"player"|"admin"}>("SELECT role FROM users WHERE id=$1 FOR UPDATE", [actor.id]);
    if(!storedActor)throw new DomainError("Учётная запись не найдена.",401);
    actor={...actor,role:actor.id===process.env.OWNER_DISCORD_ID?"owner":storedActor.role};
    switch (command.action) {
      case "settings": {
        const data = z.object({ name: z.string().trim().min(2).max(80), notifications: z.boolean(), showDiscord: z.boolean() }).parse(command.data);
        await tx.query("UPDATE users SET name=$2,settings=$3::text::jsonb WHERE id=$1", [actor.id, data.name, JSON.stringify({ notifications: data.notifications, showDiscord: data.showDiscord })]);
        return { message: "Настройки сохранены." };
      }
      case "readNotifications": {
        await tx.query("UPDATE notifications SET read_at=now() WHERE user_id=$1 AND read_at IS NULL", [actor.id]);
        return { message: "Уведомления прочитаны." };
      }
      case "revokeSession": {
        const { token_hash } = z.object({ token_hash: z.string().regex(/^[a-f0-9]{64}$/) }).parse(command.data);
        await tx.query("DELETE FROM sessions WHERE token_hash=$1 AND user_id=$2", [token_hash,actor.id]);
        return { message: "Сеанс завершён." };
      }
      case "role": {
        requireOwner(actor);
        if (Date.now()-actor.authenticatedAt.getTime()>10*60*1000) throw new DomainError("Для назначения прав повторно войдите через Discord (подтверждение действует 10 минут).", 403);
        const data = z.object({ id: z.string().regex(/^\d{17,20}$/), role: z.enum(["player","admin"]), reason: z.string().trim().min(5).max(500) }).parse(command.data);
        if (data.id===actor.id) throw new DomainError("Роль владельца задаётся только серверной настройкой.");
        const users = await tx.query("UPDATE users SET role=$2 WHERE id=$1 RETURNING id", [data.id,data.role]);
        if (!users.length) throw new DomainError("Пользователь должен сначала войти на сайт.",404);
        await tx.query("DELETE FROM sessions WHERE user_id=$1", [data.id]);
        await audit(tx,actor,"role",data.id,{ role:data.role,reason:data.reason });
        return { message: "Права изменены. Пользователю нужно войти заново." };
      }
      case "saveApplication": {
        const { data, version } = z.object({ data: characterInput, version: z.number().int().nonnegative() }).parse(command.data);
        const [existing] = await tx.query<Application>("SELECT * FROM applications WHERE owner_id=$1 FOR UPDATE", [actor.id]);
        if (existing && existing.version!==version) throw new DomainError("Анкета уже изменена. Обновите страницу.",409);
        if (existing?.status==="submitted") throw new DomainError("Дождитесь решения или возврата на исправление.",409);
        const [character] = await tx.query<Article>("SELECT * FROM articles WHERE owner_id=$1 AND kind='characters' AND status<>'deleted' FOR UPDATE", [actor.id]);
        if (character?.status==="frozen") throw new DomainError("Персонаж заморожен. Обратитесь к администрации.",409);
        if (existing) {
          await tx.query("UPDATE applications SET data=$2::text::jsonb,status='draft',article_id=$3,version=version+1,updated_at=now() WHERE id=$1", [existing.id,JSON.stringify(data),character?.id || null]);
          return { id:existing.id,message:"Черновик сохранён. Публичная анкета не изменена." };
        }
        const [app] = await tx.query<{ id:string }>("INSERT INTO applications(owner_id,data,article_id) VALUES($1,$2::text::jsonb,$3) RETURNING id",[actor.id,JSON.stringify(data),character?.id || null]);
        return { id:app.id,message:"Черновик сохранён." };
      }
      case "submitApplication": {
        const { id, version } = z.object({ id:uuid,version:z.number().int() }).parse(command.data);
        const app = await loadApplication(tx,actor,id,true);
        if (app.owner_id!==actor.id) throw new DomainError("Отправить анкету может только автор.",403);
        if (app.version!==version || !["draft","changes","rejected"].includes(app.status)) throw new DomainError("Обновите анкету перед отправкой.",409);
        const [character] = await tx.query<Article>("SELECT * FROM articles WHERE owner_id=$1 AND kind='characters' AND status='frozen' FOR UPDATE", [actor.id]);
        if (character) throw new DomainError("Персонаж заморожен. Обратитесь к администрации.",409);
        const parsed = characterInput.parse(app.data);
        if ((parsed.body+JSON.stringify(parsed.details||{})).length<100 || !parsed.race || !parsed.country || parsed.summary.length<10) throw new DomainError("Укажите страну, расу, краткое описание и анкету не короче 100 символов.");
        await tx.query("UPDATE applications SET status='submitted',submitted_at=now(),version=version+1,updated_at=now() WHERE id=$1",[id]);
        await tx.query("INSERT INTO application_versions(application_id,data) VALUES($1,$2::text::jsonb)",[id,JSON.stringify(parsed)]);
        await audit(tx,actor,"application.submit",id);
        return { message:"Анкета отправлена. Обсуждение открыто." };
      }
      case "comment": {
        const { id, body } = z.object({ id:uuid,body:z.string().trim().min(1).max(5000) }).parse(command.data);
        const app = await loadApplication(tx,actor,id,true);
        if (!app.submitted_at) throw new DomainError("Обсуждение откроется после отправки анкеты.",409);
        await rateLimit(tx,`comment:${actor.id}`,12);
        await tx.query("INSERT INTO comments(application_id,author_id,body) VALUES($1,$2,$3)",[id,actor.id,body]);
        if (actor.id!==app.owner_id) await notify(tx,app.owner_id,"Новое сообщение в обсуждении анкеты.",`/account/applications/${id}`);
        await audit(tx,actor,"application.comment",id);
        return { message:"Сообщение отправлено." };
      }
      case "review": {
        requireStaff(actor);
        const { id, decision, reason, version } = z.object({ id:uuid,decision:z.enum(["approved","changes","rejected"]),reason:z.string().trim().min(5).max(5000),version:z.number().int() }).parse(command.data);
        const app = await loadApplication(tx,actor,id,true);
        if (app.status!=="submitted" || app.version!==version) throw new DomainError("Эта версия уже рассмотрена или изменена.",409);
        if (decision==="approved") {
          const data=characterInput.parse(app.data);
          let articleId=app.article_id;
          const [owned]=await tx.query<Article>("SELECT * FROM articles WHERE owner_id=$1 AND kind='characters' AND status<>'deleted' FOR UPDATE",[app.owner_id]);
          if (owned && owned.id!==articleId) throw new DomainError("У игрока уже есть другой персонаж. Обновите привязку анкеты.",409);
          if (articleId) {
            const [article]=await tx.query<Article>("SELECT * FROM articles WHERE id=$1 FOR UPDATE",[articleId]);
            if (!article || article.owner_id!==app.owner_id || article.status!=="published") throw new DomainError("Персонаж удалён, заморожен или изменил владельца.",409);
            await tx.query("INSERT INTO revisions(article_id,actor_id,snapshot) VALUES($1,$2,$3::text::jsonb)",[articleId,actor.id,JSON.stringify(article)]);
            await tx.query("UPDATE articles SET title=$2,summary=$3,body=$4,image=$5,country=$6,organization=$7,race=$8,version=version+1,updated_at=now() WHERE id=$1",[articleId,data.title,data.summary,data.body,data.image,data.country,data.organization,data.race]);
          } else {
            articleId=randomUUID();
            await tx.query("INSERT INTO articles(id,kind,slug,title,summary,body,image,country,organization,race,status,owner_id) VALUES($1,'characters',$2,$3,$4,$5,$6,$7,$8,$9,'published',$10)",[articleId,`character-${articleId}`,data.title,data.summary,data.body,data.image,data.country,data.organization,data.race,app.owner_id]);
          }
          await tx.query("UPDATE applications SET article_id=$2 WHERE id=$1",[id,articleId]);
        }
        if (decision==="approved" && app.data.details) await tx.query("UPDATE articles SET details=$2::text::jsonb WHERE id=(SELECT article_id FROM applications WHERE id=$1)",[id,JSON.stringify({...app.data.details})]);
        await tx.query("UPDATE applications SET status=$2,version=version+1,updated_at=now() WHERE id=$1",[id,decision]);
        await tx.query("INSERT INTO comments(application_id,author_id,body) VALUES($1,$2,$3)",[id,actor.id,`${decision==='approved'?'Одобрено':decision==='changes'?'Нужны исправления':'Отклонено'}: ${reason}`]);
        await notify(tx,app.owner_id,"Администрация рассмотрела вашу анкету.",`/account/applications/${id}`);
        await audit(tx,actor,`application.${decision}`,id);
        return { message:"Решение сохранено." };
      }
      case "saveArticle": {
        requireStaff(actor);
        const { id,version,data }=z.object({id:uuid.optional(),version:z.number().int().nonnegative(),data:articleInput}).parse(command.data);
        if (data.owner_id && data.kind!=="characters") throw new DomainError("Владелец назначается только персонажу.");
        if (data.owner_id) { await tx.query("SELECT id FROM users WHERE id=$1 FOR UPDATE",[data.owner_id]); }
        if (id) {
          const [article]=await tx.query<Article>("SELECT * FROM articles WHERE id=$1 FOR UPDATE",[id]);
          if (!article || article.version!==version) throw new DomainError("Материал изменён. Обновите страницу.",409);
          if (article.status==="deleted") throw new DomainError("Сначала восстановите материал.",409);
          if (article.kind!==data.kind || article.slug!==data.slug) throw new DomainError("Адрес опубликованного материала нельзя менять.");
          if (article.owner_id && article.owner_id!==data.owner_id) throw new DomainError("Нельзя перепривязать действующего персонажа через редактор.");
          await tx.query("INSERT INTO revisions(article_id,actor_id,snapshot) VALUES($1,$2,$3::text::jsonb)",[id,actor.id,JSON.stringify(article)]);
          await tx.query("UPDATE articles SET title=$2,summary=$3,body=$4,image=$5,country=$6,organization=$7,race=$8,owner_id=$9,related=$10::text::jsonb,version=version+1,updated_at=now() WHERE id=$1",[id,data.title,data.summary,data.body,data.image,data.country,data.organization,data.race,data.owner_id,JSON.stringify(data.related)]);
          if(data.details) await tx.query("UPDATE articles SET details=$2::text::jsonb WHERE id=$1",[id,JSON.stringify(data.details)]);
          await audit(tx,actor,"article.edit",id);
          return { id,message:"Материал сохранён." };
        }
        const [article]=await tx.query<{id:string}>("INSERT INTO articles(kind,slug,title,summary,body,image,country,organization,race,owner_id,related) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::text::jsonb) RETURNING id",[data.kind,data.slug,data.title,data.summary,data.body,data.image,data.country,data.organization,data.race,data.owner_id,JSON.stringify(data.related)]);
        if(data.details) await tx.query("UPDATE articles SET details=$2::text::jsonb WHERE id=$1",[article.id,JSON.stringify(data.details)]);
        await audit(tx,actor,"article.create",article.id);
        return {id:article.id,message:"Черновик материала создан."};
      }
      case "articleStatus": {
        requireStaff(actor);
        const { id,status,version,confirmation }=z.object({id:uuid,status:z.enum(["draft","published","frozen","deleted"]),version:z.number().int(),confirmation:z.string().optional()}).parse(command.data);
        const [article]=await tx.query<Article>("SELECT * FROM articles WHERE id=$1 FOR UPDATE",[id]);
        if (!article || article.version!==version) throw new DomainError("Материал уже изменён.",409);
        if (status==="frozen" && (article.kind!=="characters" || article.status!=="published")) throw new DomainError("Заморозить можно опубликованного персонажа.");
        if (status==="deleted" && confirmation!==article.title) throw new DomainError("Для удаления введите точное название.");
        if (status==="published" && (article.body+JSON.stringify(article.details||{})).length<20) throw new DomainError("Добавьте текст материала перед публикацией.");
        await tx.query("INSERT INTO revisions(article_id,actor_id,snapshot) VALUES($1,$2,$3::text::jsonb)",[id,actor.id,JSON.stringify(article)]);
        await tx.query("UPDATE articles SET status=$2,version=version+1,updated_at=now() WHERE id=$1",[id,status]);
        await audit(tx,actor,`article.${status}`,id);
        if(article.owner_id) await notify(tx,article.owner_id,`Статус персонажа изменён: ${status==='frozen'?'заморожен':status==='deleted'?'удалён':status==='published'?'опубликован':'снят с публикации'}.`,"/account");
        return {message:"Статус обновлён."};
      }
      default: throw new DomainError("Неизвестное действие.");
    }
  });
}
