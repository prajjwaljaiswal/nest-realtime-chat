import { Module } from '@nestjs/common';
import { PdfExportService } from './pdfexport.service';

@Module({
  imports: [],
  providers: [PdfExportService],
  exports: [PdfExportService],
})
export class PdfExportModule {}
