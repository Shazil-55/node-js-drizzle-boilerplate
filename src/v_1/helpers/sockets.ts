import { Logger } from './logger';
import { Db } from '../database/drizzle/db';

export class Socket {
  public db: typeof Db;
  private io: any;
  public userChats: { [userId: string]: string[] } = {};

  constructor(io: any) {
    this.io = io;
    Logger.info('Socket initialized...');
    this.db = Db; // Singleton instance of Db
  }

  public onEvent(event: string, callback: (data: any) => void) {
    this.io.on(event, callback);
  }

  public emitEvent(event: string, data: any) {
    this.io.emit(event, data);
  }
}