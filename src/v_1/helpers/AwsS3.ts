import { Logger } from './logger';
import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { Env } from '.';

export class AwsS3Service {
  private S3: S3Client;

  constructor() {
    Logger.info('AwsS3Service initialized...');

    this.S3 = new S3Client({
      region: Env.AWS.REGION,
      credentials: {
        accessKeyId: Env.AWS.ACCESS_KEY_ID,
        secretAccessKey: Env.AWS.SECRET_ACCESS_KEY,
      },
    });
  }

  public async UploadFileToS3(file: Buffer, name: string): Promise<string> {
    const fileName = `${Date.now()}-${name}`;

    const uploadParams: PutObjectCommandInput = {
      Bucket: Env.AWS.BUCKET_NAME,
      Body: file,
      Key: fileName,
      ACL: 'public-read',
    };

    await this.S3.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${Env.AWS.BUCKET_NAME}.s3.${Env.AWS.REGION}.amazonaws.com/${fileName}`;

    return fileUrl;
  }
}
