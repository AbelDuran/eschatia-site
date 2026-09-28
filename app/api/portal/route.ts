import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ZodError } from "zod";
import { checkMutation, cookieOptions, digest, requireUser, SESSION_COOKIE } from "@/lib/auth";
import { database } from "@/lib/database";
import { DomainError } from "@/lib/models";
import { mutate } from "@/lib/portal-service";

export async function POST(request: Request) {
  try {
    checkMutation(request);
    const actor=await requireUser();
    // Bound the decoded body even when Content-Length is omitted or forged.
    const reader=request.body?.getReader();
    if(!reader) throw new DomainError("Пустой запрос.");
    const chunks:Uint8Array[]=[]; let size=0;
    for(;;) { const {done,value}=await reader.read(); if(done) break; size+=value.length; if(size>160000) { await reader.cancel(); throw new DomainError("Слишком большой запрос.",413); } chunks.push(value); }
    let input: { action?: string };
    try { input=JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new DomainError("Некорректный JSON."); }
    if (!input || typeof input!=="object" || Array.isArray(input)) throw new DomainError("Ожидается объект запроса.");
    if (input.action==="logout" || input.action==="logoutAll") {
      const jar=await cookies();
      if(input.action==="logoutAll") await database().query("DELETE FROM sessions WHERE user_id=$1",[actor.id]);
      else await database().query("DELETE FROM sessions WHERE token_hash=$1",[digest(jar.get(SESSION_COOKIE)?.value || "")]);
      jar.set(SESSION_COOKIE,"",{...cookieOptions,maxAge:0});
      return NextResponse.json({message:"Вы вышли из кабинета.",logout:true},{headers:{"Cache-Control":"no-store"}});
    }
    const result=await mutate(database(),actor,input);
    return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}});
  } catch(error) {
    const status=error instanceof DomainError?error.status:error instanceof ZodError?400:500;
    const code=(error as { code?:string }).code;
    const message=error instanceof DomainError?error.message:error instanceof ZodError?"Проверьте обязательные поля, формат ссылок и длину текста.":code==="23505"?"Этот адрес занят или у пользователя уже есть персонаж.":code==="23503"?"Выбранный пользователь должен сначала войти через Discord.":"Не удалось сохранить. Попробуйте ещё раз.";
    return NextResponse.json({error:message},{status:code==="23505"?409:status,headers:{"Cache-Control":"no-store"}});
  }
}

