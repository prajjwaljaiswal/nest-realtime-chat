import { Module } from '@nestjs/common';
import { MessagesService } from './services/messages.service';
import { MessagesController } from './controllers/messages.controller';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { FileService } from '@providers/files/files.service';

@Module({
  providers: [SeqeulizeService, MessagesService, FileService],
  controllers: [MessagesController],
})
export class MessagesModule {}
