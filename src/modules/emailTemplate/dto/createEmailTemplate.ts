import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreateEmailTemplateDTO {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean = true;
}

export class GetAllEmailTemplateDTO {
  @Type(() => Number)
  @IsInt()
  @ApiProperty()
  page: number;

  @Type(() => Number)
  @IsInt()
  @ApiProperty()
  limit: number;

  @ApiProperty()
  keyword?: string;

  @ApiProperty()
  sort?: string;

  @ApiProperty()
  filter?: {
    [key: string]: unknown;
  };
}
export class UpdateEmailTemplateDTO {
  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean = true;
}
