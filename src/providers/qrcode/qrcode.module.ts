// import { loadModels } from '@common/utils';
import { Module } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';

@Module({
  imports: [],
  providers: [QrcodeService],
  exports: [QrcodeService],
})
export class QrcodeModule {}
