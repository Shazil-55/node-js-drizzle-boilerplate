import admin, { ServiceAccount } from 'firebase-admin'; // Import firebase-admin using ES6 syntax
import { Logger } from './logger'; // Adjust the import path according to your project structure
import serviceAccount from './firebase-admin-sdk-json-file.json'; // Import the JSON file directly
import { Db } from '../database/drizzle/db';

export class NotificationService {
  public admin = admin;
  public db: typeof Db;

  constructor() {
    this.db = Db;

    Logger.info('NotificationService initialized...');

    this.admin.initializeApp({
      credential: this.admin.credential.cert(serviceAccount as ServiceAccount),
    });

    Logger.info('Firebase Admin Initialized');
  }

  public async sendNotificationToUsers(
    userId: string,
    token: string,
    title: string,
    body: string,
    deepLink = '/',
  ): Promise<void> {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        deepLink: deepLink,
      },
      token: token,
    };
    Logger.info('Sending Notification...', message);

    try {
      const response = await this.admin.messaging().send(message);
      Logger.info('Successfully sent message:', response);
      // await this.db.User.AddNotification({
      //   userId: userId,
      //   title: title,
      //   body: body,
      //   notificationType: 'simple',
      //   deepLink: deepLink,
      // });
    } catch (error) {
      Logger.error('Error sending message:', error);
      // throw new Error('Failed to send notification');
    }
  }
}
export const notification = new NotificationService();
