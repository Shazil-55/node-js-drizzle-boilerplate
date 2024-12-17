import { Db } from '../../database/drizzle/db';
import { Logger } from '../../helpers/logger';
import { Entities } from '../../helpers';

export class UserService {
  private db: typeof Db;

  constructor(args: { Db: typeof Db }) {
    Logger.info('UserService initialized...');
    this.db = args.Db;
  }

  public async GetUser(where: Partial<Entities.User>): Promise<void> {
    Logger.info('UserService.GetUser', { where });
  }
}
