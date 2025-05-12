import { envConfig } from '@common/configs/env.config';
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs';

@Injectable()
export class ImageService {
  async imageUpload(
    file: any,
    filePath: string,
    resize = false,
    fixFileName = ''
  ) {
    try {
      const envJwt = envConfig();
      // const originalname = file.originalname;
      let bufferData = file.buffer;
      if (resize) {
        bufferData = await this.imageResize(bufferData);
      }
      // Define your desired file path
      const dirPath = `${envJwt.uploadPath + filePath}/`;

      await fs.promises.rm(dirPath, {
        recursive: true,
        force: true,
      });
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const uploadPath = `${dirPath}${
        (fixFileName || 'image' + new Date().getTime()) + '.png'
      }`;
      await fs.promises.writeFile(uploadPath, bufferData);

      return uploadPath;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async imageResize(buffer) {
    try {
      const transformer = sharp(buffer)
        .resize(200)
        .toFormat('webp')
        .toBuffer((err) => {
          if (err) console.log('create buffer error', err);
        });
      return transformer;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
