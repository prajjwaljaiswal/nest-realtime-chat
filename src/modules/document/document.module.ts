import { Module } from '@nestjs/common';
import { documentController } from './document.controller';
import { DocumentService } from './document.service';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { FileService } from '@providers/files/files.service';
@Module({
  controllers: [documentController],
  providers: [DocumentService, SeqeulizeService, FileService],
})
export class DocumentModule {}
