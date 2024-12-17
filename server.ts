import app from './app';
import { Server } from './src/v_1/helpers/env';
import { Logger } from './src/v_1/helpers/logger';

const port: string | number = Server.PORT;

app.listen(port, () => {
  Logger.info('Server Running on http://localhost:' + port);
});
