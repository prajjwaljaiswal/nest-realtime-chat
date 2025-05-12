import { Injectable } from '@nestjs/common';
import QRCode from 'qrcode';
import path from 'path';
@Injectable()
export class QrcodeService {
  async genrateQrCode(fileName: string, data: string) {
    await QRCode.toFile(
      path.join(process.cwd(), `public/qrcode/${fileName}`),
      data
    );
    return `/images/public/qrcode/${fileName}`;
  }
}
