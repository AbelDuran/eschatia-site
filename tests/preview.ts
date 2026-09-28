// Local-only fixture server. Never used by npm start, deployed routes, or real OAuth.
import { createServer } from "node:http";
import { createHash, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import next from "next";
import { database } from "../lib/database";
import { seed } from "../lib/seed";

async function main(){
  if(process.env.NODE_ENV==="production")throw Error("Fixture preview is forbidden in production");
  Object.assign(process.env,{NODE_ENV:"development",DATABASE_POOL_SIZE:"1",DATABASE_URL:"postgresql://postgres:postgres@127.0.0.1:55439/postgres",APP_URL:"http://127.0.0.1:3102",OWNER_DISCORD_ID:"100000000000000001",DISCORD_CLIENT_ID:"test-only",DISCORD_CLIENT_SECRET:"test-only"});
  const pg=new PGlite();await pg.exec(await readFile("db/001_portal.sql","utf8"));
  const socket=new PGLiteSocketServer({db:pg,port:55439,host:"127.0.0.1",maxConnections:10});await socket.start();
  const db=database();await seed(db);
  const tokens:Record<string,string>={};
  for(const [role,id,name] of [["owner","100000000000000001","Владелец (тест)"],["admin","100000000000000002","Администратор (тест)"],["player","100000000000000003","Игрок (тест)"],["other","100000000000000004","Другой игрок (тест)"]]){
    await db.query("INSERT INTO users(id,name,discord_name,role) VALUES($1,$2,$2,$3)",[id,name,role==="admin"?"admin":"player"]);
    const token=randomBytes(32).toString("hex");tokens[role]=token;
    await db.query("INSERT INTO sessions(token_hash,user_id,expires_at,device) VALUES($1,$2,now()+interval '1 day','Локальная тестовая сессия')",[createHash("sha256").update(token).digest("hex"),id]);
  }
  const app=next({dev:true,hostname:"127.0.0.1",port:3102,conf:{distDir:".next/portal-preview"}});await app.prepare();const handle=app.getRequestHandler();
  const server=createServer((req,res)=>{
    if(req.headers.host!=="127.0.0.1:3102"){res.writeHead(403);res.end();return;}
    const role=req.url?.match(/^\/__fixture\/(owner|admin|player|other)$/)?.[1];
    if(role){res.setHeader("Set-Cookie",`eschatia-session=${tokens[role]}; Path=/; HttpOnly; SameSite=Lax`);res.writeHead(302,{Location:"/account"});res.end();return;}
    void handle(req,res);
  });
  server.listen(3102,"127.0.0.1",()=>console.log("Local fixture preview: http://127.0.0.1:3102/__fixture/owner (also admin, player, other). All data is in memory."));
  const stop=async()=>{server.close();await app.close();await socket.stop();await pg.close();process.exit(0);};
  process.on("SIGINT",()=>{void stop();});process.on("SIGTERM",()=>{void stop();});
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Preview failed");process.exit(1);});
