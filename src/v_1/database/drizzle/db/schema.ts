import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const userProfiles = pgTable('user_profiles', {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }),
  profile_image: varchar({ length: 255 }),
  cover_image: varchar({ length: 255 }),
  created_at: timestamp().notNull(),
  updated_at: timestamp().notNull(),
});
