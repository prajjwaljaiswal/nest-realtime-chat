import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsUUID } from 'class-validator';

export class CreateDTO {
  @ApiProperty({
    example: 'Percentage',
    enum: ['Fixed', 'Percentage'],
    description: 'Commission Value Type',
  })
  @IsEnum(['Fixed', 'Percentage'])
  commissionValueType: string;

  @ApiProperty({
    example: 30.5,
    description: 'Commission Value (up to 2 decimal places)',
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 },
    {
      message: 'Commission value must be a number with up to 2 decimal places.',
    }
  )
  commissionValue: number;
}

export class UpdateDTO extends CreateDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;
}
