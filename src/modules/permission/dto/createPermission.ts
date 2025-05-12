import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { ROLES } from '@common/global-interfaces';

export class CreatePermissionDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  read: boolean;

  @IsBoolean()
  @IsNotEmpty()
  edit: boolean;

  @IsBoolean()
  @IsNotEmpty()
  delete: boolean;

  @IsBoolean()
  @IsNotEmpty()
  create: boolean;
}

export class UpdatePermissionDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  read: boolean;

  @IsBoolean()
  @IsNotEmpty()
  edit: boolean;

  @IsBoolean()
  @IsNotEmpty()
  delete: boolean;

  @IsBoolean()
  @IsNotEmpty()
  create: boolean;
}

export class UpdateStatusDTO {
  key: 'read' | 'create' | 'edit' | 'delete';
}

export class GetByIdDTO {
  moduleName: string;
  role: ROLES;
}
export class GetAllPermissionDTO {
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
