import { z } from "zod";

export const missing = (subject: string) => `[НЕДОСТАТОЧНО ИНФОРМАЦИИ] ${subject}`;
export const archiveCategories: Record<string, string> = {
  chronology:"Хронология", catastrophe:"Катастрофа", deities:"Божества", wars:"Войны",
  people:"Важные личности", geography:"География", religions:"Религии", terms:"Термины",
  items:"Предметы", events:"События", rules:"Правила и механики", history:"История", other:"Другие материалы",
};
export const newsTypes = ["Событие", "Обновление", "Сюжет", "Объявление", "Персонажи", "Правила", "Изменения мира", "События игроков", "Патчноуты", "Другое"];
const text = z.string().trim().max(200).optional();
const longText = z.string().trim().max(20000).optional();
const path = z.string().regex(/^\/(characters|countries|organizations|races|lore|news)\/[a-z0-9-]+$/).or(z.literal(""));
const picture = z.string().max(1000).refine(v => !v || /^\/(?!\/)[\w ./-]+\.(png|jpe?g|webp|gif)$/i.test(v) && !v.includes("..") || (()=>{try{const u=new URL(v);return u.protocol==="https:"&&!u.username&&!u.password;}catch{return false;}})());
export const detailsInput = z.object({
  nickname:text, role:text, age:text, sector:text, estate:text, languages:z.array(z.string().trim().max(80)).max(20).optional(),
  tags:z.array(z.string().trim().min(1).max(80)).max(30).optional(), category:z.string().max(60).optional(),
  newsType:z.enum(["Событие","Обновление","Сюжет","Объявление","Персонажи","Правила","Изменения мира","События игроков","Патчноуты","Другое"]).optional(),
  date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v).or(z.literal("")).optional(),
  personality:longText, features:longText, abilities:longText, biography:longText, extra:longText,
  physical:z.array(z.object({label:z.string().trim().min(1).max(100),value:z.string().trim().max(1000)})).max(30).optional(),
  blocks:z.array(z.object({title:z.string().trim().min(1).max(150),type:z.string().trim().max(100),body:z.string().trim().max(20000)})).max(30).optional(),
  language:text, faith:text, faithPath:path.optional(),
  ruler:z.object({name:z.string().max(200),title:z.string().max(200),image:picture,body:z.string().max(4000),href:path}).optional(),
  application:z.string().max(1000).refine(v=>!v||/^https:\/\/discord\.com\/channels\/\d+\/\d+$/.test(v)).optional(),
}).strict();
export type ContentDetails = z.infer<typeof detailsInput>;
