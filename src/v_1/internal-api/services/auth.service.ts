import { createClient } from '@supabase/supabase-js';
import { Db } from '../../database/drizzle/db';
import { Logger } from '../../helpers/logger';
import * as AuthModel from '../models/auth.model';
import { Supabase } from '../../helpers/env';
import { userProfiles } from '../../database/drizzle/db/schema';

export class AuthService {
  private db: typeof Db;

  constructor(args: { Db: typeof Db }) {
    Logger.info('AuthService initialized...');
    this.db = args.Db;
  }

  public async CreateUser(user: AuthModel.RegisterUserBody): Promise<AuthModel.AuthSession | string | undefined> {
    const supabase = createClient(Supabase.SUPABASE_URL, Supabase.ANON_KEY);
    const { data, error } = await supabase.auth.signUp({ email: user.email, password: user.password });
    if (error) {
      Logger.error('Error creating user', error.message);
      if (error.message === 'User already registered') {
        return 'User already exists';
      }
      return undefined;
    } else {
      if (data.user && data.session) {
        this.db.insert(userProfiles).values([
          {
            id: data.user.id,
            name: user.name,
            created_at: new Date(data.user.created_at),
            updated_at: data.user.updated_at?.toString()
              ? new Date(data.user.updated_at)
              : new Date(data.user.created_at),
          },
        ]);
        return {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        };
      } else {
        Logger.error('Error creating user');
        return undefined;
      }
    }
  }
}
