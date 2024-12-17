import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Database } from '../../helpers/env';

const connectionString = Database.DATABASE_URL;
export const client = postgres(connectionString, { prepare: false });
export const Db = drizzle(client);
