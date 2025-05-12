import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, SeqeulizeService],
  imports: [],
})
export class SettingsModule {}
