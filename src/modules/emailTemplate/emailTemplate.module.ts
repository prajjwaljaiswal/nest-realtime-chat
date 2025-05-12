import { Module } from '@nestjs/common';

import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { EmailTemplateController } from './controllers/emailTemplate.controller';
import { EmailTemplateService } from './services/emailTemplate.service';

@Module({
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService, SeqeulizeService],
  imports: [],
})
export class EmailTemplateModule {}
