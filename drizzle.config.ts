import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { Database } from './src/v_1/helpers/env';

export default defineConfig({
  out: './drizzle',
  schema: './src/v_1/database/drizzle/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: Database.DATABASE_URL,
  },
});
