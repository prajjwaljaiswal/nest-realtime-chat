import { Module } from '@nestjs/common';
import { DocumentCategoryController } from './documentCategory.controller';
import { DocumentCategoryService } from './documentCategory.service';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';

@Module({
  controllers: [DocumentCategoryController],
  providers: [DocumentCategoryService, SeqeulizeService],
})
export class DocumentCategoryModule {}
