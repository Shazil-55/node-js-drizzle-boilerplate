import * as express from 'express';
import { Response, Request } from 'express';
import { Db } from '../../database/drizzle/db';
import { Logger } from '../../helpers/logger';
import { genericError, RequestBody, RequestQuery } from '../../helpers/utils';
import { UserService } from '../services/user.service';
import { Entities, Hash } from '../../helpers';

export class UserController {
  public router: express.Router;

  constructor() {
    Logger.info('User controller initialized...');
    this.router = express.Router();
    this.UserRouter();
  }

  private UserRouter(): void {
    this.router.get('/', async (req: Request, res: Response) => {
      let body;
      try {
        const service = new UserService({ Db });
        const userId = req.userId;
        const response = await service.GetUser({ id: userId });

        body = {
          data: response,
        };
      } catch (error) {
        genericError(error, res);
      }
      res.json(body);
    });
  }
}
