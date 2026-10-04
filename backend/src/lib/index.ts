import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from 'pg'
import * as schema  from '../lib/schema.ts'


const pool = new Pool({
  connectionString: String(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
})

const db = drizzle(pool, { schema })


export default db
