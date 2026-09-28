import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { closeDatabase, database } from "../lib/database";
import { mutate } from "../lib/portal-service";
import type { Application,Article,Actor } from "../lib/models";

test("PostgreSQL wire driver preserves JSON objects, arrays and revision snapshots",async()=>{
  const pg=new PGlite();await pg.exec(await readFile("db/001_portal.sql","utf8"));
  const socket=new PGLiteSocketServer({db:pg,host:"127.0.0.1",port:55440,maxConnections:1});await socket.start();
  process.env.DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55440/postgres";process.env.DATABASE_POOL_SIZE="1";process.env.OWNER_DISCORD_ID="200000000000000001";
  try {
    const db=database();const owner:Actor={id:process.env.OWNER_DISCORD_ID,name:"Владелец",role:"owner",authenticatedAt:new Date()};
    await db.query("INSERT INTO users(id,name,discord_name) VALUES($1,'Тест','Тест')",[owner.id]);
    const data={title:"Анкета через драйвер",summary:"Краткое описание для проверки",body:"Подробная биография героя. ".repeat(10),country:"Джоспиора",race:"Человек",organization:"",image:""};
    const result=await mutate(db,owner,{action:"saveApplication",data:{version:0,data}});
    const [app]=await db.query<Application>("SELECT * FROM applications WHERE id=$1",[result.id]);
    assert.equal(typeof app.data,"object");assert.equal(app.data.title,data.title);
    await mutate(db,owner,{action:"submitApplication",data:{id:app.id,version:app.version}});
    await mutate(db,owner,{action:"settings",data:{name:"Новое имя",notifications:false,showDiscord:true}});
    const [user]=await db.query<{settings:{notifications:boolean}}>("SELECT settings FROM users WHERE id=$1",[owner.id]);assert.equal(user.settings.notifications,false);
    const created=await mutate(db,owner,{action:"saveArticle",data:{version:0,data:{...data,kind:"news",slug:"wire-news",owner_id:null,related:["/countries/jospiora"]}}});
    const [article]=await db.query<Article>("SELECT * FROM articles WHERE id=$1",[created.id]);assert.deepEqual(article.related,["/countries/jospiora"]);
    await mutate(db,owner,{action:"articleStatus",data:{id:article.id,version:article.version,status:"published"}});
    const [revision]=await db.query<{snapshot:Article}>("SELECT snapshot FROM revisions WHERE article_id=$1",[article.id]);assert.equal(revision.snapshot.title,data.title);
  } finally {await closeDatabase();await socket.stop();await pg.close();}
});
