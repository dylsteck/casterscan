import { Kysely, PostgresDialect } from 'kysely'
import Pool from 'pg-pool'

export const db = new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.PG_CONNECTION_STRING,
      }),
    }),
  });
