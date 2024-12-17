import { Db } from './db';
import { userProfiles } from './db/schema';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Supabase } from '../../helpers/env';
import { UserTypes } from '../../helpers/entities';
import { Logger } from '../../helpers';
dotenv.config({ path: './.env.development' });

if (!('DATABASE_URL' in process.env)) throw new Error('DATABASE_URL not found on .env.development');

export const SeedAdmin = async () => {
  const data: (typeof userProfiles.$inferInsert)[] = [];
  const supabase = createClient(Supabase.SUPABASE_URL, Supabase.SERVICE_ROLE_KEY);
  Logger.Logger.info('Creating admin user...',supabase);
  const { data: response, error } = await supabase.auth.admin.createUser({
    email: 'admin@gmail.com',
    password: 'supersecret',
    // email_confirm: true, .=
    // role: UserTypes.Admin,
  });
  if (error) {
    console.log('Error creating admin', error);
    return;
  }
  if (response.user) {
    data.push({
      id: response.user.id,
      name: 'Admin',
      created_at: new Date(response.user.created_at),
      updated_at: response.user.updated_at ? new Date(response.user?.updated_at) : new Date(response.user.created_at),
    });
    console.log('Seed start');
    await Db.insert(userProfiles).values(data);
    console.log('Seed done');
  } else {
    console.log('Error creating user');
  }
};
