import express from 'express';
import { Logger } from './src/v_1/helpers/logger';
import { Swagger } from './src/v_1/helpers/env';
import helmet from 'helmet';
import xss from 'xss-clean';
import SwaggerUI from 'swagger-ui-express';
import SwaggerDocs from './swagger.json';
import { ApiController } from './src/v_1/internal-api/controller';
import { SeedAdmin } from './src/v_1/database/drizzle/seed';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
class App {
  private httpServer: HttpServer;
  private io: SocketIOServer;
  public app: express.Application;
  constructor() {
    this.app = express();
    this.middlewares();
    this.seedMiddlewares();
    this.routes();
    this.sockets();
    this.httpServer = new HttpServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });
  }

  private middlewares(): void {
    Logger.info('Middlewares are being initialized...');

    this.app.use(xss());
    this.app.use(helmet());

    this.app.use(Swagger.PATH + '/v_1', SwaggerUI.serve, SwaggerUI.setup(SwaggerDocs));

    Logger.info('Middlewares are initialized successfully...');
  }

  private async seedMiddlewares(): Promise<void> {
    Logger.info('Seed Middlewares are being initialized...');
    await SeedAdmin();
    Logger.info('Middlewares are initialized successfully...');
  }

  private routes(): void {
    Logger.info('Routes are being initialized...');

    this.app.use(`/api/v_1/internal`, new ApiController().router);

    this.app.use(`*`, (req, res) => {
      res.status(404).json({ message: 'Route not Found' });
    });

    Logger.info('Routes initialized successfully...');
  }
  private sockets(): void {
    Logger.info('Sockets initialized successfully...');
    this.io.on('connection', (socket) => {
      Logger.info('A user connected');
      
      socket.on('disconnect', () => {
        socket.disconnect();
        Logger.info('A user disconnected');
      });
    });
  }
}
export default new App().app;
