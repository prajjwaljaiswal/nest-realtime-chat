import { Module } from '@nestjs/common';

import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { PermissionController } from './controllers/permission.controller';
import { PermissionService } from './services/permission.service';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, SeqeulizeService],
  imports: [],
})
export class PermissionModule {}
