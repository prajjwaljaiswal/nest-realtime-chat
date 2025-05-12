import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreateCategoryDTO {
  @IsNotEmpty()
  @ApiProperty({
    example: 'My Title',
    description: 'The title of the category',
  })
  @IsString()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: true,
    description:
      'The status of the category (true for active, false for inactive)',
  })
  status: boolean;
}
export class GetAllCategoryDTO {
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
