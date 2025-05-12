import { Module } from '@nestjs/common';
import { ExportService } from './export.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ExportService],
})
export class ExportModule {}
