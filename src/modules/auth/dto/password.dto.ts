import { IsPasswordMatching } from '@common/decorators/validation/password-matching.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class ResetPasswordDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;

  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class ForgotPasswordDTO {
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class CreatePasswordDTO {
  @IsNotEmpty({ message: 'Verification code token required' })
  @ApiProperty()
  otpToken: string;

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

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @Length(8, 16, {
    message: 'Password must be between 8 and 16 characters long.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/, {
    message:
      'Password must contain at least 1 uppercase, 1 lowercase, 1 numeric character, 1 special character, and be 8 to 16 characters long.',
  })
  @ApiProperty()
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @IsPasswordMatching('password')
  confirmPassword?: string;
}

export class ChangePasswordDTO {
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  oldPassword: string;

  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  newPassword: string;
}
