// import { loadModels } from '@common/utils';
import { Module } from '@nestjs/common';
import { SequelizeModule as SQModule } from '@nestjs/sequelize';
import models from '@src/models';
import { SeqeulizeService } from './sequelize.service';

@Module({
  imports: [SQModule.forFeature(models)],
  providers: [SeqeulizeService],
  exports: [SQModule, SeqeulizeService],
})
export class SequelizeModule {}
