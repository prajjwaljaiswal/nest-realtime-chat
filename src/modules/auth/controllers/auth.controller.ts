import {
  Body,
  Controller,
  Post,
  Headers,
  Request,
  HttpCode,
  Delete,
  Put,
  // Get,
  UseInterceptors,
  UploadedFile,
  Req,
  // UploadedFiles,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Public } from '@common/decorators/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { validateFile } from '@common/global-helpers/all.helpers';
import {
  ChangePasswordDTO,
  CreatePasswordDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from '../dto/password.dto';
import { AuthUser } from '@common/decorators/authUser.decorator';
import {
  GenerateOtpDTO,
  LoginUserDTO,
  SignupDTO,
  UpdateAvatarDto,
  UpdateDetailsDTO,
  updateExpertFeeDetailsDTO,
  updateExpertPersonalDetailsDTO,
  updateExpertSpecialitiesDetailsDTO,
  UpdatePasswordDTO,
  UpdatePersonalDetailsDTO,
  UpdateSolicitorProfileDetailsDTO,
  UpdateUserDocumentsDto,
  VerifyOtpDTO,
} from '../dto/auth.dto';
import { Users } from '@src/models/user.model';
import {
  FileInterceptor,
  FilesInterceptor,
  NoFilesInterceptor,
} from '@nestjs/platform-express';
// import { FileFieldsInterceptor } from '@nestjs/platform-express';
// import { imageFileFilter, storage } from '@common/global-helpers/all.helpers';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Define allowed file types for document uploads
  private readonly uploadFileType = ['image/jpeg', 'image/png'];
  private readonly uploadDocumentFileType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  // LoginUserDTO

  @Public()
  @HttpCode(200)
  @ApiTags('Admin')
  @Post('login')
  @ApiOperation({ description: 'Admin user login' })
  @ApiBody({ type: LoginUserDTO })
  async login(
    @Headers() headers,
    @Body() payload: LoginUserDTO,
    @Request() req
  ) {
    req.message = 'User login successfully.';
    return this.authService.login(headers, payload, false);
  }

  @Public()
  @HttpCode(200)
  @ApiTags('Web')
  @Post('web-login')
  @ApiOperation({
    summary: 'Web portal user Login for expert/solicitor',
    description: 'Allow expert and solicitors to login into web portal',
  })
  @ApiBody({ type: LoginUserDTO })
  async webLogin(
    @Headers() headers,
    @Body() payload: LoginUserDTO,
    @Request() req
  ) {
    req.message = 'User has been logged in successfully.';
    return this.authService.webLogin(headers, payload, false);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ description: 'Reset password' })
  @ApiBody({ type: ResetPasswordDTO })
  async resetPasswprd(@Body() payload: ResetPasswordDTO, @Request() req) {
    const message = await this.authService.resetPassword(payload);
    req.message = message;
    return {};
  }

  @Public()
  @ApiOperation({
    summary: 'Create Passsword in Mobile',
    description: 'Allows users to  create password for mobile users',
  })
  @Post('create-password')
  @ApiOperation({ description: 'Create password' })
  @ApiBody({ type: CreatePasswordDTO })
  async createPasswprd(@Body() payload: CreatePasswordDTO, @Request() req) {
    req.message = 'Password created successfully.';
    return this.authService.createPassword(payload);
  }

  @Public()
  @Post('forgot-password')
  @ApiBody({ type: ForgotPasswordDTO })
  async forgotPasswprd(@Body() payload: ForgotPasswordDTO, @Request() req) {
    const message = await this.authService.forgotPassword(payload);
    req.message = message;
    return {};
  }

  @Post('get-auth-user')
  @ApiBearerAuth('Authorization')
  async getAuthUser(@AuthUser() user: Users) {
    return this.authService.getAuthUser(user.id);
  }

  @Post('change-password')
  @ApiOperation({ description: 'Change Password' })
  @ApiBearerAuth('Authorization')
  @ApiBody({ type: ChangePasswordDTO })
  async changePassword(
    @AuthUser() user: Users,
    @Body() req: ChangePasswordDTO
  ) {
    return await this.authService.changePassword(user.id, req);
  }

  @Post('update-password-web')
  async updatePasswordforWeb(@Body() data: ChangePasswordDTO, @Req() req) {
    const userId = req.user.id; // Assuming you have authentication and req.user is set
    return this.authService.updatePasswordforWeb(userId, data);
  }

  @Post('update-details')
  async updateDetails(
    @AuthUser() user: Users,
    @Body() payload: UpdateDetailsDTO
  ) {
    return this.authService.updateDetails(user.id, payload);
  }

  @Post('update-solicitor-details')
  async updateSolicitorDetails(
    @AuthUser() user: Users,
    @Body() payload: UpdateSolicitorProfileDetailsDTO
  ) {
    return this.authService.updateSolicitorProfileDetails(user.id, payload);
  }

  // update expert profile personal details
  @ApiTags('Web')
  @ApiOperation({
    summary: 'Update Expert Personal Details in Web',
    description: 'Allows expert user to update personal details in the profile section',
  })
  @ApiBearerAuth('Authorization')
  @Post('update-expert-personal-details')
  async updateExpertPersonalDetails(
    @AuthUser() user: Users,
    @Body() payload: updateExpertPersonalDetailsDTO,
    @Request() req
  ) {
    req.message = 'Expert personal details updated successfully.';
    return this.authService.updateExpertPersonalDetails(user.id, payload);
  }



  @ApiTags('Mobile')
  @ApiOperation({
    summary: 'Update Personal Details in Mobile',
    description: 'Allows users to Update Personal Details for mobile users',
  })
  @ApiBearerAuth('Authorization')
  @Post('update-personal-details')
  async updatePersonalDetails(
    @AuthUser() user: Users,
    @Body() payload: UpdatePersonalDetailsDTO
  ) {
    const userId = user.id;
    return this.authService.updatePersonalDetails(userId, payload);
  }

  @ApiTags('Mobile')
  @ApiOperation({
    summary: 'Update User Password in Mobile',
    description: 'Allows users to update User Password for mobile users',
  })
  @Post('update-user-password')
  @ApiBearerAuth('Authorization')
  async updatePassword(
    @AuthUser() user: Users,
    @Body() payload: UpdatePasswordDTO
  ) {
    const payloadData = {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    };
    return this.authService.updatePassword(user.id, payloadData);
  }

  @ApiTags('Web')
  @ApiOperation({
    summary: 'Generate otp and resend otp in web',
    description: 'Allows users to Generate otp and resend otp for web users',
  })
  @Public()
  @Post('generate-otp')
  async generateOtp(@Body() payload: GenerateOtpDTO, @Request() req) {
    req.message = 'Verification code has been sent successfully to your email address.';
    return this.authService.generateOtp(payload);
  }

  @ApiOperation({
    summary: 'Generate otp and resend otp',
    description: 'Allows users to Generate otp and resend otp ',
  })
  @Public()
  @Post('generate-otp-admin')
  async generateOtpAdmin(@Body() payload: GenerateOtpDTO) {
    return this.authService.generateOtpAdmin(payload);
  }

  @ApiTags('Web')
  @ApiOperation({
    summary: 'Verify otp for the web',
    description: 'Allows users to verify otp for the web users',
  })
  @Public()
  @Post('verify-otp')
  async verifyOTP(@Body() payload: VerifyOtpDTO, @Request() req) {
    req.message = 'Verification code has been successfully verified.';
    return this.authService.verifyOTP(payload);
  }

  @ApiOperation({
    summary: 'Verify otp',
    description: 'Allows users to verify otp',
  })
  @Public()
  @Post('verify-otp-admin')
  async verifyOTPAdmin(@Body() payload: VerifyOtpDTO, @Request() req) {
    req.message = 'Verification code has been successfully verified.';
    return this.authService.verifyOTPAdmin(payload);
  }

  @ApiTags('Web')
  @ApiOperation({
    summary: 'Sign up in Web',
    description: 'Allows users (experts/solicitors) to sign up for web portal',
  })
  @Public()
  @Post('signup')
  async signup(@Body() payload: SignupDTO, @Request() req) {
    req.message = 'Your account has been created successfully.';
    return this.authService.signup(payload);
  }

  @ApiTags('Web')
  @ApiOperation({
    summary: 'Delete Account in Web',
    description: 'Allows users to delete account for web users',
  })
  @ApiBearerAuth('Authorization')
  @Delete('delete-account')
  async deleteAccount(@AuthUser() user: Users) {
    return this.authService.deleteAccount(user.id);
  }

  @Put('update-avatar')
  @ApiOperation({ description: 'API to update user profile avatar' }) // Operation description for Swagger
  @ApiBody({ type: UpdateAvatarDto }) // Body parameters for document update
  @UseInterceptors(FileInterceptor('avatarFile')) // Handle file upload
  async updateAvatar(
    @UploadedFile() avatarFile: Express.Multer.File, // The uploaded document file
    @Body() body: UpdateAvatarDto // Document details to be updated
  ) {
    // Validate the uploaded file (check size, type, etc.)
    await validateFile(
      {
        avatarFile: avatarFile,
      },
      {
        avatarFile: {
          required: false,
          maxSize: 1, // 1MB max size
          allowedTypes: this.uploadFileType, // Allowed file types
        },
      }
    );

    // Call the service method to update the document
    return await this.authService.updateAvatar(
      {
        id: body.id,
        avatarName: body.avatarName,
      },
      avatarFile
    );
  }

}
