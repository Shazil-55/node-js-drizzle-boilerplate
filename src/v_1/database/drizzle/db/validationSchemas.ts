import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userProfiles } from './schema';

export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const selectUserProfileSchema = createSelectSchema(userProfiles);
