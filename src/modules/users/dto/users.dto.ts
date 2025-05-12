import { ROLES } from '@common/global-interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

enum USER_ROLE {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  SOLICITOR = 'SOLICITOR',
  EXPERT = 'EXPERT',
}

enum APPROVE_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class GeneralUserDataDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lastname: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  // @IsPhoneNumber()
  @ApiProperty()
  phone: string;

  @IsNotEmpty()
  @IsEnum(USER_ROLE)
  @ApiProperty()
  role: USER_ROLE;
}

export class UpdateUserDTO extends GeneralUserDataDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  dial_code: string;
}

export class CreateUserDTO extends GeneralUserDataDTO {
  @ApiProperty()
  password?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  dial_code: string;
}

export class UpdateMobileUserDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required.' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters.' })
  @ApiProperty()
  firstname: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required.' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters.' })
  @Matches(/^[A-Za-z'’-]+(?: [A-Za-z'’-]+)*$/, {
    message:
      'Last name must contain only alphabetic characters, spaces, hyphens, or apostrophes.',
  })
  @ApiProperty()
  lastname: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required.' })
  @Length(10, 15, { message: 'Phone number must be between 10 and 15 digits.' })
  @Matches(/^(?!0)(\+?\d{10,15})$/, {
    message: 'Please enter a valid phone number format (e.g., +1234567890)',
  })
  @Matches(/^\d+$/, {
    message:
      'Phone number can only contain digits and cannot contain special characters.',
  })
  @ApiProperty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  dial_code: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  location?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  state: string;

  @IsNotEmpty({ message: 'The email field is required.' })
  @IsString()
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @Length(5, 254, {
    message: 'Email address must be between 5 and 254 characters long.',
  })
  @ApiProperty({
    example: 'example@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @IsEnum(USER_ROLE)
  @ApiProperty()
  role?: USER_ROLE;
}

export class CreateMobileUserDTO {
  @IsString()
  @IsNotEmpty({ message: 'First name is required.' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters.' })
  @ApiProperty()
  firstname: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required.' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters.' })
  @Matches(/^[A-Za-z'’-]+(?: [A-Za-z'’-]+)*$/, {
    message:
      'Last name must contain only alphabetic characters, spaces, hyphens, or apostrophes.',
  })
  @ApiProperty()
  lastname: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required.' })
  @Length(10, 15, { message: 'Phone number must be between 10 and 15 digits.' })
  @Matches(/^(?!0)(\+?\d{10,15})$/, {
    message: 'Please enter a valid phone number format (e.g., +1234567890)',
  })
  @Matches(/^\d+$/, {
    message:
      'Phone number can only contain digits and cannot contain special characters.',
  })
  @ApiProperty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  dial_code: string;

  @IsNotEmpty({ message: 'The email field is required.' })
  @IsString()
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @Length(5, 254, {
    message: 'Email address must be between 5 and 254 characters long.',
  })
  @ApiProperty({
    example: 'example@gmail.com',
  })
  email: string;

}

export class UserStatusDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  id: string;
}

export class GetAllUsersDTO {
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
  filter?: string | ROLES | { [key: string]: unknown };

  // @IsNotEmpty()
  // @IsEnum(USER_ROLE)
  // @ApiProperty()
  // role?: USER_ROLE;
}

export class DeleteUserDTO {
  @IsArray()
  @ApiProperty()
  id: string[];
}

export class ApprovalUserDTO {
  @IsArray()
  @ApiProperty()
  id: string[];

  @IsNotEmpty()
  @IsEnum(APPROVE_STATUS)
  @ApiProperty()
  approvalStatus?: APPROVE_STATUS;

  @IsString()
  @ApiProperty()
  rejectionComments: string;
}

export class CountDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  role: string;
}

export class CreateBulkUsers {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  company: string;
}
