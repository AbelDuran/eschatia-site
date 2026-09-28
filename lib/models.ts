import { z } from "zod";

export const kinds = ["news", "characters", "countries", "organizations", "races", "lore"] as const;
export const kindNames: Record<string, string> = { news: "Новости", characters: "Персонажи", countries: "Страны", organizations: "Организации", races: "Расы", lore: "Мировой архив" };
export type Kind = typeof kinds[number];
export type Role = "player" | "admin" | "owner";
export type Actor = { id: string; name: string; role: Role; authenticatedAt: Date };
export type Article = {
  id: string; kind: Kind; slug: string; title: string; summary: string; body: string;
  image: string; country: string; organization: string; race: string;
  status: "draft" | "published" | "frozen" | "deleted"; owner_id: string | null;
  related: string[]; version: number; created_at: string; updated_at: string;
};
export type Application = {
  id: string; owner_id: string; article_id: string | null; status: "draft" | "submitted" | "changes" | "approved" | "rejected";
  data: CharacterInput; version: number; submitted_at: string | null; updated_at: string;
};
export const imageInput = z.string().max(1000).refine(value => {
  if (!value) return true;
  if (/^\/(?!\/)[a-zA-Z0-9_./ -]+\.(png|jpe?g|webp|gif)$/i.test(value) && !value.includes("..")) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}, "Изображение: локальный путь или HTTPS-ссылка.");
export const characterInput = z.object({
  title: z.string().trim().min(2).max(120), summary: z.string().trim().max(600),
  body: z.string().trim().max(60000), image: imageInput,
  country: z.string().trim().max(100), organization: z.string().trim().max(150), race: z.string().trim().max(100),
});
export type CharacterInput = z.infer<typeof characterInput>;
export const articleInput = characterInput.extend({
  kind: z.enum(kinds), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  owner_id: z.string().regex(/^\d{17,20}$/).nullable(),
  related: z.array(z.string().regex(/^\/(characters|countries|organizations|races|news|lore)\/[a-z0-9-]+$/)).max(12),
});
export function articlePath(article: Pick<Article, "kind" | "slug">) { return `/${article.kind}/${article.slug}`; }
export const statusNames: Record<string, string> = { draft: "Черновик", submitted: "На рассмотрении", changes: "Нужны исправления", approved: "Одобрена", rejected: "Отклонена", published: "Опубликовано", frozen: "Заморожен", deleted: "Удалено" };
export class DomainError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function requireStaff(actor: Actor) { if (actor.role === "player") throw new DomainError("Доступ только для администрации.", 403); }
export function requireOwner(actor: Actor) { if (actor.role !== "owner") throw new DomainError("Назначать права может только владелец.", 403); }

