import * as express from 'express';
import { Response } from 'express';
import { Db } from '../../database/drizzle/db';
import { Logger } from '../../helpers/logger';
import { genericError, RequestBody } from '../../helpers/utils';
import * as AuthModel from '../models/auth.model';
import { AuthService } from '../services/auth.service';

export class AuthController {
  public router: express.Router;

  constructor() {
    Logger.info('Auth controller initialized...');

    this.router = express.Router();

    this.AuthRouter();
  }

  private AuthRouter(): void {
    this.router.post('/register', async (req: RequestBody<AuthModel.RegisterUserBody>, res: Response) => {
      let body;
      try {
        await AuthModel.RegisterUserBodySchema.parseAsync(req.body);

        const service = new AuthService({ Db });

        const response = await service.CreateUser(req.body);
        if (!response) return res.status(500).json({ error: 'Something went wrong' });
        if (response && typeof response === 'string') {
          return res.status(400).json({ error: 'User already exists' });
        } else {
          body = {
            data: response,
          };
          return res.json(body);
        }
      } catch (error) {
        genericError(error, res);
      }
      res.json(body);
    });
  }
}
