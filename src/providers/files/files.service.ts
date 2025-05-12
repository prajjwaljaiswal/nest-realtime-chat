import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as AWS from 'aws-sdk';

@Injectable()
export class FileService {
  private s3: AWS.S3 | null = null;
  private allowAWS: boolean;

  constructor(private readonly configService: ConfigService) {
    this.allowAWS =
      this.configService.get<string>('ALLOW_AWS') === 'true' ? true : false;

    if (this.allowAWS) {
      // Initialize S3 client if ALLOW_AWS is true
      this.s3 = new AWS.S3({
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY'
        ),
        region: this.configService.get<string>('AWS_REGION'),
        params: {
          Bucket: '',
        },
      });
    }
  }

  async uploadFile(file: Express.Multer.File, newFileName: string): Promise<string> {
    if (this.allowAWS && this.s3) {
      // Upload file to S3 bucket
      const params = {
        Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
        Key: newFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const result = await this.s3.upload(params).promise();
      console.log("fileUploadDetails",result);
      return result.Location; // Return the S3 file URL
    } else {
      // Get the base upload directory (public/categories)
      const uploadPath = this.configService.get<string>('UPLOAD_PATH');

      // Define the full file path inside the category directory
      const filePath = path.join(uploadPath, file.originalname);
      // Save the file buffer to the newly created directory
      fs.writeFileSync(uploadPath, file.buffer);
      return filePath; // Return the saved file's path
    }
  }

  async uploadFileDocument(file: Express.Multer.File, slug: string, folderName: string): Promise<string> {
    if (this.allowAWS && this.s3) {
      // Upload file to S3 bucket
      const params = {
        Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
        Key: folderName+`/`+file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const result = await this.s3.upload(params).promise();
      //console.log("fileUploadDetails",result);
      return result.Location; // Return the S3 file URL
    } else {
      // Get the base upload directory (public/categories)
      const uploadPath = this.configService.get<string>('UPLOAD_PATH');

      // Construct category-specific directory path using ID
      const categoryDir = path.join(uploadPath, 'categories', slug);
      // Ensure the category directory exists
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      // Define the full file path inside the category directory
      const filePath = path.join(categoryDir, file.originalname);
      // Save the file buffer to the newly created directory
      fs.writeFileSync(filePath, file.buffer);

      return filePath; // Return the saved file's path
    }
  }
  
  // async uploadFile(file: Express.Multer.File, slug: string, newFileName: string): Promise<string> {
  //   if (this.allowAWS && this.s3) {
  //     // Upload file to S3 bucket
  //     const params = {
  //       Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
  //       Key: newFileName,
  //       Body: file.buffer,
  //       ContentType: file.mimetype,
  //     };

  //     const result = await this.s3.upload(params).promise();
  //     //console.log("fileUploadDetails",result);
  //     return result.Location; // Return the S3 file URL
  //   } else {
  //     // Get the base upload directory (public/categories)
  //     const uploadPath = this.configService.get<string>('UPLOAD_PATH');

  //     // Construct category-specific directory path using ID
  //     const categoryDir = path.join(uploadPath, 'categories', slug);
  //     // Ensure the category directory exists
  //     if (!fs.existsSync(categoryDir)) {
  //       fs.mkdirSync(categoryDir, { recursive: true });
  //     }

  //     // Define the full file path inside the category directory
  //     const filePath = path.join(categoryDir, file.originalname);
  //     // Save the file buffer to the newly created directory
  //     fs.writeFileSync(filePath, file.buffer);

  //     return filePath; // Return the saved file's path
  //   }
  // }
  async deleteFile(fileName: string) {
    if (this.allowAWS && this.s3) {
      // Delete file from S3 bucket
      const params = {
        Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
        Key: fileName,
      };
      const deleteRes = await this.s3.deleteObject(params).promise();
      console.log('File deleted from S3:', deleteRes);
    } else {
      // Delete file from local storage
      const filePath = path.join(
        this.configService.get<string>('UPLOAD_PATH'),
        fileName
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.error(`File not found: ${filePath}`);
      }
    }
  }

  async moveFile(sourcePath: string, destinationPath: string) {
    //console.log({ sourcePath, destinationPath });
  }

  async getFilePath(fileName: string): Promise<string> {
    if (this.allowAWS && this.s3) {
      // Generate a pre-signed URL for the private S3 bucket
      const params = {
        Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
        Key: fileName,
        Expires: 60 * 60 * 6, // URL expiration time in seconds (e.g., 6 hour)
      };
  
      const signedUrl = this.s3.getSignedUrl('getObject', params);
      return signedUrl; // Return the pre-signed URL
    } else {
      // Return the local file path
      return fileName;
    }
  }
}
