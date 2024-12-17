import * as express from 'express';
import { Request, Response } from 'express';
import { Logger } from '../../helpers/logger';
import { genericError } from '../../helpers/utils';
import { CommonService } from '../services/common.service';

export class CommonController {
  public router: express.Router;

  constructor() {
    Logger.info('Common controller initialized...');
    this.router = express.Router();
    this.CommonRouter();
  }

  private CommonRouter(): void {
    this.router.get('/status', (req: Request, res: Response) => {
      let body;
      try {
        const service = new CommonService();

        const response = service.GetHealthStatus();

        body = {
          data: response,
        };
      } catch (error) {
        genericError(error, res);
      }
      res.json(body);
    });

    this.router.post('/upload-file', async (req: Request, res: Response) => {
      let body;
      try {
        const service = new CommonService();

        const response = await service.UploadImage(req.files);

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
