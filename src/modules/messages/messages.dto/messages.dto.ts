import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {


  @IsString()
  @IsUUID()
  @ApiProperty()
  senderId: string;

  @IsString()
  @IsUUID()
  @ApiProperty()
  receiverId: string;

  @IsString()
  @ApiProperty()
  message: string;

  @IsString()
  @ApiProperty()
  messageType: string; // TEXT, FILE, BOTH
}

export class UpdateMessageDto extends PartialType(CreateMessageDto) {}
export class GetMessageDto {
  @IsString()
  @IsUUID()
  @ApiProperty()
  senderId: string;

  @IsString()
  @IsUUID()
  @ApiProperty()
  receiverId: string;

}

export class DeleteMessageDto {
  @IsArray()
  @ApiProperty()
  id: string[];
}
