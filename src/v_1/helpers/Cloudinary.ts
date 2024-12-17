import { Logger } from './logger';
import { v2 as cloudinary } from 'cloudinary';
import { Env } from '.';
import fileUpload from 'express-fileupload';
import { AppError } from './errors';

export class Cloudinary {
  constructor() {
    Logger.info('AwsS3Service initialized...');

    cloudinary.config({
      cloud_name: Env.Cloudinary.CLOUD_NAME,
      api_key: Env.Cloudinary.API_KEY,
      api_secret: Env.Cloudinary.API_SECRET,
    });
  }

  public async uploadFileToCloudinary(file: fileUpload.UploadedFile): Promise<string> {
    try {
      Logger.info('uploadFileToCloudinary initialized...');

      const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,` + file.data.toString(`base64`));
      return result.secure_url;
    } catch (error) {
      Logger.error(`Error uploading to Cloudinary: ${error}`);
      throw new AppError(400, 'Unable to upload file');
    }
  }

  public async uploadFileToCloudinaryFromBase64(base64: string): Promise<string> {
    try {
      Logger.info('uploadFileToCloudinary initialized...');

      const result = await cloudinary.uploader.upload(`data:image/png;base64,` + base64);
      return result.secure_url;
    } catch (error) {
      Logger.error(`Error uploading to Cloudinary: ${error}`);
      throw new AppError(400, 'Unable to upload file');
    }
  }
}
