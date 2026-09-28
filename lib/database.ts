import postgres from "postgres";

export interface Database {
  query<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<T[]>;
  transaction<T>(run: (db: Database) => Promise<T>): Promise<T>;
}
const globalDatabase=globalThis as typeof globalThis & { eschatiaSql?:ReturnType<typeof postgres> };
export function databaseConfigured() { return Boolean(process.env.DATABASE_URL); }
export async function closeDatabase() { await globalDatabase.eschatiaSql?.end(); delete globalDatabase.eschatiaSql; }
export function database(): Database {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  const poolSize=Number(process.env.DATABASE_POOL_SIZE||5);
  const connection=globalDatabase.eschatiaSql ??= postgres(process.env.DATABASE_URL, { max: Number.isInteger(poolSize)&&poolSize>=1&&poolSize<=20?poolSize:5, prepare: false, idle_timeout: 20, connect_timeout: 10 });
  const wrap = (sql: ReturnType<typeof postgres> | postgres.TransactionSql): Database => ({
    query: async <T>(text: string, values: unknown[] = []) => await sql.unsafe(text, values as postgres.ParameterOrJSON<never>[]) as unknown as T[],
    transaction: async <T>(run: (db: Database) => Promise<T>) => {
      if (!("begin" in sql)) return run(wrap(sql));
      return await sql.begin(tx => run(wrap(tx))) as T;
    },
  });
  return wrap(connection);
}

