import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  ValidationPipe,
  UsePipes,
  Request,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { CreateDTO, UpdateDTO } from './dto/settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get('/')
  async getById(@Request() req) {
    req.message = 'Case Type Fetched Successfully.';
    return await this.service.GetById();
  }

  @Post('/')
  @ApiBody({ type: CreateDTO })
  async create(@Body() payload: CreateDTO, @Request() req) {
    req.message = 'Case Type Created Successfully.';
    return await this.service.Create(payload);
  }

  @Put('/')
  async update(@Body() payload: UpdateDTO, @Request() req) {
    req.message = 'The Case Type has been updated successfully.';
    return await this.service.update(payload);
  }
}
