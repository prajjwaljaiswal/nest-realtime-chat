import { Injectable } from '@nestjs/common';

import { Parser } from '@json2csv/plainjs';
@Injectable()
export class ExportService {
  async exportData(data: any) {
    const parser = new Parser();
    const csv = parser.parse(data);
    return { data: csv };
  }
}
