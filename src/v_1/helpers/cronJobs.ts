import cron from 'node-cron';
import { Logger } from './logger';
import { Db } from '../database/drizzle/db';

export class CronJobService {
  public db: typeof Db;

  constructor() {
    this.db = Db;
    Logger.info('CronJobService initialized...');
  }
  public scheduleCronJob(cronTime: string, callback: () => void) {
    try {
      cron.schedule(cronTime, callback);
      Logger.info(`Cron job scheduled for ${cronTime}`);
    } catch (error) {
      Logger.error(`Error scheduling cron job: ${error}`);
    }
  }

  public scheduleDailyCronJob(callback: () => void) {
    this.scheduleCronJob('0 0 * * *', callback);
  }

  public scheduleMonthlyCronJob(callback: () => void) {
    this.scheduleCronJob('0 0 1 * *', callback);
  }

  public scheduleYearlyCronJob(callback: () => void) {
    this.scheduleCronJob('0 0 1 1 *', callback);
  }

  public schedule24HoursFromNowCronJob(callback: () => void) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const cronTime = `${tomorrow.getMinutes()} ${tomorrow.getHours()} ${tomorrow.getDate()} ${tomorrow.getMonth() + 1} *`;
    this.scheduleCronJob(cronTime, callback);
  }
}
