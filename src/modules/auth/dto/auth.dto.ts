import { INVALID_EMAIL } from '@common/constants/strings';
import { IsPasswordMatching } from '@common/decorators/validation/password-matching.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
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

export class LoginUserDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEmail({}, { message: INVALID_EMAIL })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  rememberme: boolean;
}

export class VerifyOtpDTO {
  @IsNotEmpty({ message: 'The verification code field is required.' })
  @IsString()
  @Length(6, 6, { message: 'Verification code must be 6 digits long.' })
  @Matches(/^\d{4,6}$/, { message: 'Entered verification code is invalid.' })
  @ApiProperty({
    example: '123456',
  })
  otp: string;

  @IsNotEmpty({ message: 'The verification code type field is required.' })
  @IsString()
  @ApiProperty({
    example: 'signup',
  })
  otpType: string;

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

export class SignupDTO {
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

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  location: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  postcode: string;

  @IsString()
  @ApiProperty()
  companyname: string;

  @IsNotEmpty()
  @IsEnum(USER_ROLE)
  @ApiProperty()
  role?: USER_ROLE;
}

export class GenerateOtpDTO {
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

  @IsNotEmpty({ message: 'The verification code type field is required.' })
  @IsEnum(
    {
      signup: 'signup',
      resend: 'resend',
      forgotpassword: 'forgotpassword',
      login: 'login',
    },
    {
      message:
        'otpType must be one of the following: "signup", "resend", "forgotpassword", "login"',
    }
  )
  @ApiProperty({
    example: 'signup',
    enum: ['signup', 'resend', 'forgotpassword', 'login'],
  })
  otpType: 'signup' | 'resend' | 'forgotpassword' | 'login';
}

export class UpdateDetailsDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastname: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  password?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @IsPasswordMatching('password')
  confirmPassword?: string;
}

export class UpdateSolicitorProfileDetailsDTO {
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

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  location: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  postcode: string;

  @IsString()
  @ApiProperty()
  companyname: string;

  @IsString()
  @ApiProperty()
  experienceDetails: string;
}

export class updateExpertPersonalDetailsDTO {
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

  @IsNotEmpty({ message: 'The email field is required.' })
  @IsString()
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @Length(5, 100, {
    message: 'Email address must be between 5 and 100 characters long.',
  })
  @ApiProperty({
    example: 'example@gmail.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required.' })
  @Length(10, 15, { message: 'Phone number must be between 10 and 15 digits.' })
  @Matches(/^(?!0)(\+?\d{10,15})$/, {
    message: 'Please enter a valid phone number format (e.g., 1234567890)',
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

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  location: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  city: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  postcode: string;

  @IsString()
  @ApiProperty()
  companyName: string;

  @IsString()
  @ApiProperty()
  jobTitle: string;

  @IsNumber()
  @ApiProperty()
  totalExperience: number;

  @IsNumber()
  @ApiProperty()
  totalProfessionalExperience: number;
}

export class ExpertSpecialityDetailsDTO {
  @ApiProperty({
    description: 'ID of the speciality',
    example: '667b90f2-f69e-45be-915b-f8adc72bd98c',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Name of the speciality',
    example: 'Psychology',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ExpertFeeDataDTO {
  @ApiProperty({
    description: 'ID of the caseType',
    example: '667b90f2-f69e-45be-915b-f8adc72bd98c',
  })
  @IsString()
  @IsNotEmpty()
  caseTypeId: string;

  @ApiProperty({
    description: 'Hourly Rate of this case type',
    example: 150,
  })
  @IsNumber()
  @IsNotEmpty()
  hourlyRate: number;

  @ApiProperty({
    description: 'Individual 1 client estimated hours',
    example: '10',
  })
  @IsNumber()
  individual1: number;

  @ApiProperty({
    description: 'Individual 2 client estimated hours',
    example: '20',
  })
  @IsNumber()
  individual2: number;

  @ApiProperty({
    description: 'Individual 3 client estimated hours',
    example: '30',
  })
  @IsNumber()
  individual3: number;

  @ApiProperty({
    description: 'Comment for this case type',
    example: 'This is a comment',
  })
  @IsString()
  comment: string;
}

export class updateExpertSpecialitiesDetailsDTO {
  @ApiProperty({
    description: 'List of expert specialities',
    type: [ExpertSpecialityDetailsDTO], // Reference the new class
    example: [
      { name: 'Psychology', id: '667b90f2-f69e-45be-915b-f8adc72bd98c' },
      { name: 'ENT', id: '9463ddf8-82f5-4845-abc2-51399c6d469b' },
    ],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'expertSpecialities array should not be empty.' })
  @IsNotEmpty({ each: true })
  expertSpecialities: ExpertSpecialityDetailsDTO[];

  @ApiProperty({
    description: 'List of expert case specialities',
    type: [ExpertSpecialityDetailsDTO], // Reference the new class
    example: [
      { name: 'Care/Family', id: 'c4052375-8dbb-49c1-936e-404b706e2b26' },
    ],
  })
  @IsArray()
  @ArrayNotEmpty({
    message: 'expertCaseSpecialities array should not be empty.',
  })
  @IsNotEmpty({ each: true })
  expertCaseSpecialities: ExpertSpecialityDetailsDTO[];
}

export class updateExpertFeeDetailsDTO {
  @ApiProperty({
    description: 'List of expert specialities',
    type: [ExpertFeeDataDTO], // Reference the new class
    example: [
      {
        caseTypeId: '99876fb6-fa57-42fb-8380-eb486b76ddea',
        hourlyRate: '106',
        individual1: '10',
        individual2: '15',
        individual3: '20',
        comment: 'This is a comment',
      },
      {
        caseTypeId: 'c4052375-8dbb-49c1-936e-404b706e2b26',
        hourlyRate: '105',
        individual1: '10',
        individual2: '15',
        individual3: '20',
        comment: 'This is a comment',
      },
    ],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'expertFeeDetails array should not be empty.' })
  @IsNotEmpty({ each: true })
  expertFeeDetails: ExpertFeeDataDTO[];
}

export class UpdatePasswordDTO {
  @IsString()
  @ApiProperty()
  currentPassword: string;

  @IsString()
  @ApiProperty()
  newPassword: string;

  @IsString()
  @ApiProperty()
  @IsPasswordMatching('password')
  confirmNewPassword?: string;
}

export class UpdatePersonalDetailsDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastname: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  dial_code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;
}

export class UpdateIndustryDetailsDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  industry: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  state: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  jobtitle: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  jobtitleSlug: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  location: string;
}

export class UpdatePasswordPayload {
  @IsString()
  @ApiProperty()
  currentPassword: string;

  @IsString()
  @ApiProperty()
  newPassword: string;
}

export class UpdateAvatarDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  id: string;

  @IsString() // Validate that the avatar is a string (optional)
  @IsOptional() // Makes the avatar optional for this DTO
  avatarName: string; // Optionally update the avatar
}

export class UpdateUserDocumentsDto {
  @IsString() // Validate that the cv name is a string (optional)
  @IsOptional() // Makes the cv name optional for this DTO
  documentName: string; // Optionally update the cv name

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  experienceDetails: string;

  @IsString()
  @ApiProperty()
  registerBodyId: string;

  @IsString()
  @ApiProperty()
  documentType: string;

  @IsString()
  @ApiProperty()
  removeUserDocument: string;
}
