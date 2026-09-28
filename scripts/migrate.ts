import { loadEnvConfig } from "@next/env";
import { readFile } from "node:fs/promises";
import { database } from "../lib/database";
import { seed } from "../lib/seed";
loadEnvConfig(process.cwd());
async function main(){
  const db=database();
  await db.transaction(async tx=>{
    await tx.query("SELECT pg_advisory_xact_lock(483719)");
    await tx.query(await readFile("db/001_portal.sql","utf8"));
    await seed(tx);
  });
  console.log("База подготовлена. Существующие материалы сохранены; повторный запуск безопасен.");
}
main().then(()=>process.exit(0)).catch(()=>{console.error("Миграция не выполнена. Проверьте DATABASE_URL и доступ к PostgreSQL. Секреты не выводятся.");process.exit(1);});

