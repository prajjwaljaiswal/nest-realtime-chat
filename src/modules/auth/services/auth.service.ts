import { UserService } from '@modules/users/services/users.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PasswordService } from './password.service';
import { EmailService } from '@providers/email/email.service';
import {
  ChangePasswordDTO,
  CreatePasswordDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from '../dto/password.dto';
import {
  dateDiff,
  decrypt,
  encrypt,
  formatDate,
  generateOTP,
  getDiffMinute,
  validateCountryCodeAndDialCode,
} from '@common/global-helpers/all.helpers';
import { PASSWORD_CHANGE_EXPIRE } from '@common/constants/global.constants';
import {
  IPayloadUserJwt,
  USER_DOCUMENT_TYPES,
  ROLES as USER_ROLES,
} from '@common/global-interfaces';
import {
  GenerateOtpDTO,
  LoginUserDTO,
  SignupDTO,
  UpdateAvatarDto,
  UpdateDetailsDTO,
  updateExpertFeeDetailsDTO,
  updateExpertPersonalDetailsDTO,
  updateExpertSpecialitiesDetailsDTO,
  UpdatePasswordPayload,
  UpdatePersonalDetailsDTO,
  UpdateSolicitorProfileDetailsDTO,
  UpdateUserDocumentsDto,
  VerifyOtpDTO,
} from '../dto/auth.dto';
import moment from 'moment';
import { Users } from '@src/models/user.model';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { Lockout } from '@src/models/lockout.model';
import { Otp } from '@src/models/otp.model';
import { FileService } from '@providers/files/files.service';
import * as bcrypt from 'bcrypt';
import path from 'path';
import { Op } from 'sequelize'; // Import Sequelize operators
import { ExpertSpecialities } from '@src/models/expertSpecialities.model';
import { Specialities } from '@src/models/specialities.model';
import { ExpertCaseSpecialities } from '@src/models/expertCaseSpecialities.model';
import { CaseType } from '@src/models/caseType.model';
import { ExpertFeeStructure } from '@src/models/expertFeeStructure.model';
import { UserDocuments } from '@src/models/userDocuments.model';
import { RegisterBodies } from '@src/models/registerBodies.model';

// Extend UserDocuments to include documentPath
interface UserDocumentsWithDocumentPath extends UserDocuments {
  documentPath?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private passwordService: PasswordService,
    private emailService: EmailService,
    private db: SeqeulizeService,
    private readonly fileUpload: FileService // Service to handle file uploads
  ) { }

  async validate_user(email: string) {
    email = email.toLowerCase(); // Convert email to lowercase
    const user = await this.db.get(Users, {
      where: { email: email, isDeleted: false },
    });
    if (!user) {
      throw new BadRequestException(
        'The email address is not registered with us or the login details are incorrect. Please try again with the correct information.'
      );
    }
    // if (!user.isUserEmailVerify) {
    //   throw new BadRequestException(
    //     'Your email has not been verified. Please verify your email address to proceed further.'
    //   );
    // }
    if (!user.status) {
      throw new BadRequestException(
        'Your account has not been activated yet. Please reach out to the administration for more information.'
      );
    }

    return user;
  }

  async handleLockoutAttempts(header: string) {
    let noOfAttempts = await this.db.count(Lockout, {
      where: {
        userIP: header,
      },
    });
    if (noOfAttempts >= 5) {
      const lastAttempt = await this.db.getAll(Lockout, {
        where: {
          userIP: header,
        },
        order: [['createdAt', 'desc']],
        limit: 1,
      });
      if (
        lastAttempt.length &&
        lastAttempt[0]?.lockoutTimeout &&
        dateDiff(lastAttempt[0]?.lockoutTimeout, new Date(), 'minutes') > 0
      ) {
        throw new BadRequestException(
          `You have been lockout. Please try after ${dateDiff(
            lastAttempt[0]?.lockoutTimeout,
            new Date(),
            'minutes'
          )} minutes`
        );
      } else {
        // Now the time has been passed out so clear the attemps and let it try again
        await this.db.delete(Lockout, {
          where: {
            userIP: header,
          },
        });
        noOfAttempts = 0;
      }
    }
    return noOfAttempts;
  }

  async login(
    headers,
    { email, password, rememberme }: LoginUserDTO,
    isUser = false
  ) {
    try {
      const header = headers['x-forwarded-for'] ?? '0.0.0.0';
      const user = await this.validate_user(email);

      // if (isStaff && user.role !== 'STAFF') {
      //   throw new BadRequestException('You are not authorized access.');
      // }
      // const noOfAttempts = await this.handleLockoutAttempts(header);
      const isMatchedPassword = await this.passwordService.validatePassword(
        password,
        user.password
      );
      if (user && isMatchedPassword) {
        const lastLoginTime = formatDate(null, null, true);
        // Generate auth token and update user info
        const payload: IPayloadUserJwt = {
          userId: user.id,
          rememberme: rememberme,
          lastLogin: lastLoginTime,
        };
        const authToken =
          await this.passwordService.generateAuthTokenFromLogin(payload);

        await Promise.all([
          this.db.update(
            Users,
            { lastLogin: lastLoginTime },
            { where: { id: user.id } }
          ),
          this.db.delete(Lockout, { where: { userIP: header } }),
        ]);

        const query = {
          attributes: [
            'id',
            'fullname',
            'firstname',
            'lastname',
            'email',
            'phone',
            'phoneCode',
            'countryCode',
          ],
        };
        const userData = await this.db.getByPk(Users, user.id, query);
        // delete user.password;
        // delete user.auth;
        // const userData = {
        //   fulllName: user.fullname,
        //   id: user.id,
        //   firstname: user.firstname,
        //   lastname: user.lastname,
        //   email: user.email,
        //   industry: user.industry,
        //   jobtitle: user.jobtitle,
        //   location: user.location,
        //   role: user.role,
        //   phone: user.phone,
        // };

        return {
          ...userData.toJSON(),
          accessToken: authToken?.accessToken,
          refreshToken: authToken?.refreshToken,
          lastLogin: lastLoginTime,
          tokenExpiry: authToken.tokenExpiry,
        };
      } else {
        // await this.handleFailedLoginAttempt(header, noOfAttempts);
        throw new BadRequestException(
          'Invalid email address or password. Please try again.'
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async webLogin(
    headers,
    { email, password, rememberme }: LoginUserDTO,
    isUser = false
  ) {
    try {
      const header = headers['x-forwarded-for'] ?? '0.0.0.0';
      const user = await this.validate_user(email);

      //const noOfAttempts = await this.handleLockoutAttempts(header);
      const isMatchedPassword = await this.passwordService.validatePassword(
        password,
        user.password
      );
      if (user && isMatchedPassword) {
        const lastLoginTime = formatDate(null, null, true);
        // Generate auth token and update user info
        const payload: IPayloadUserJwt = {
          userId: user.id,
          rememberme: rememberme,
          lastLogin: lastLoginTime,
        };
        const authToken =
          await this.passwordService.generateAuthTokenFromLogin(payload);

        await Promise.all([
          this.db.update(
            Users,
            { lastLogin: lastLoginTime },
            { where: { id: user.id } }
          ),
          this.db.delete(Lockout, { where: { userIP: header } }),
        ]);

        const query = {
          attributes: [
            'id',
            'fullname',
            'firstname',
            'lastname',
            'email',
            'phone',
            'phoneCode',
            'role',
            'avatar',
            'location',
            'postcode',
            'totalExperience',
            'isProfileSetup',
            'isUserEmailVerify',
            //'bio',
            'experienceDetails',
            'countryCode',
          ],
        };
        const userData = await this.db.getByPk(Users, user.id, query);
        let avatarPath = userData?.avatar || '';
        if (userData?.avatar) {
          // generate the avatar url
          avatarPath = await this.fileUpload.getFilePath(userData.avatar);
        }

        return {
          ...userData.toJSON(),
          accessToken: authToken?.accessToken,
          refreshToken: authToken?.refreshToken,
          lastLogin: lastLoginTime,
          tokenExpiry: authToken?.tokenExpiry,
          avatarPath: avatarPath,
        };
      } else {
        // await this.handleFailedLoginAttempt(header, noOfAttempts);
        throw new BadRequestException(
          'The email address and password combination is incorrect. Please try again with the correct login details.'
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async handleFailedLoginAttempt(header, noOfAttempts) {
    await this.db.create(Lockout, {
      userIP: header,
      lockoutTimeout: moment(new Date()).add(20, 'minute').toISOString(),
    });

    if (noOfAttempts + 1 >= 2) {
      const remainingAttempt = 5 - (noOfAttempts + 1);
      if (remainingAttempt === 0) {
        throw new BadRequestException(
          'You have been locked out. Please try after 20 minutes'
        );
      }
      throw new BadRequestException(
        `Invalid email address or password. Please try again. ${remainingAttempt} ${remainingAttempt > 1 ? 'attempts' : 'attempt'
        } remaining`
      );
    }
  }

  async resetPassword(data: ResetPasswordDTO) {
    try {
      const decryptData = await decrypt(data.token);
      if (!decryptData) {
        throw new BadRequestException('Invalid Token');
      }
      const where = {
        email: decryptData.email,
      };
      const user = await this.db.get(Users, { where });
      if (!user) {
        throw new BadRequestException('No user found');
      }

      // if (!user.auth?.token) {
      //   throw new BadRequestException('Your token has expired.');
      // }

      // if (data.token !== user.auth?.token) {
      //   throw new BadRequestException('Your token has expired.');
      // }

      // if (
      //   !user.auth.tokenTimeout ||
      //   getDiffMinute(user.auth.tokenTimeout) > PASSWORD_CHANGE_EXPIRE
      // )
      // throw new BadRequestException(
      //   'Your password change request has expired.'
      // );
      const hashedPassword = await this.passwordService.hashPassword(
        data.password
      );
      const updatePayload = {
        password: hashedPassword,
      };
      if (user.isUserEmailVerify === false) {
        updatePayload['status'] = true;
        updatePayload['isUserEmailVerify'] = true;
      }
      await this.userService.updatePassword({
        id: user.id,
        updatedPayload: updatePayload,
      });
      if (user.isUserEmailVerify) {
        const clientUrl = process.env.CLIENT_URL;
        const logoUrl = `${clientUrl}assets/images/logo_copy.png`;

        this.emailService.sendEmail({
          template: 'user.updatePassword',
          slug: 'update-password',
          email: user.email,
          subject: `Password Updated Successfully`,
          body: {
            email: user.email,
            logoUrl: logoUrl,
            fullName: `${user.firstname} ${user.lastname || ''}`,
          },
        });
      }

      return `Password successfully updated!`;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async forgotPassword(data: ForgotPasswordDTO) {
    try {
      const clientUrl = process.env.CLIENT_URL;

      // Convert the email to lowercase
      data.email = data.email.toLowerCase();

      const where = {
        email: data.email,
      };

      const user = await this.db.get(Users, { where });

      if (!user) {
        throw new BadRequestException(
          'The email address you entered does not exist in our system.'
        );
      }

      const token = encrypt({ email: data.email });
      const createPayload = {
        auth: { token, tokenTimeout: new Date().toISOString() },
      };
      const logoUrl = `${clientUrl}assets/images/logo_copy.png`;

      await this.emailService.sendEmail({
        template: 'user.resetPassword',
        slug: 'reset_password',
        email: data.email,
        subject: 'Reset Password',
        body: {
          url: `${clientUrl}reset-password?token=${token}`,
          name: `${user.firstname} ${user.lastname || ''}`,
          email: data.email,
          logoUrl: logoUrl,
        },
      });

      const [isUpdated] = await this.db.update(Users, createPayload, {
        where: { id: user.id },
      });

      if (isUpdated) {
        return `Email sent successfully.`;
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createPassword(data: CreatePasswordDTO) {
    try {
      const email = data.email;
      const [user, OtpData] = await Promise.all([
        this.db.get(Users, {
          where: {
            email: email,
          },
        }),
        this.db.getByPk(Otp, data.otpToken),
      ]);

      if (!OtpData) {
        throw new BadRequestException('The verification code token is invalid');
      }
      // const lastLoginTime = formatDate(null, null, true);
      const hashedNewPassword = await this.passwordService.hashPassword(
        data.password
      );
      // user.lastLogin = lastLoginTime;
      user.password = hashedNewPassword;
      user.save();

      // const payload: IPayloadUserJwt = {
      //   userId: user.id,
      //   lastLogin: lastLoginTime,
      // };

      // const authToken =
      //   await this.passwordService.generateAuthTokenFromLogin(payload);

      const userData = await this.db.getByPk(Users, user.id, {
        attributes: [
          'id',
          'fullname',
          'firstname',
          'lastname',
          'email',
          'phone',
        ],
      });

      return {
        ...userData.toJSON(),
        // accessToken: authToken?.accessToken,
        // refreshToken: authToken?.refreshToken,
        // lastLogin: lastLoginTime,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changePassword(userId: string, data: ChangePasswordDTO) {
    try {
      const user = await this.db.get(Users, {
        where: {
          id: userId,
        },
      });

      const isMatchedOldPassword = await this.passwordService.validatePassword(
        data.oldPassword,
        user.password
      );

      if (!isMatchedOldPassword) {
        return {
          message: `Old password didn't match.`,
        };
      }
      const hashedNewPassword = await this.passwordService.hashPassword(
        data.newPassword
      );

      const updatePayload = {
        password: hashedNewPassword,
        // lastLogin: lastLoginTime,
      };
      this.userService.updatePassword({
        id: user.id,
        updatedPayload: updatePayload,
      });

      // const authToken =
      //   await this.passwordService.generateAuthTokenFromLogin(payload);

      // user['accessToken'] = authToken?.accessToken;
      return {
        message: `Password successfully updated!`,
        data: user,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updatePasswordforWeb(userId: string, data: ChangePasswordDTO) {
    try {
      const user = await this.db.get(Users, {
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isMatch = await bcrypt.compare(data.oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Current password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await user.update({ password: hashedPassword });

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAuthUser(userId: string) {
    try {
      // Fetch the user data from the database, including expertSpecialities
      const userData = await this.db.get(Users, {
        where: { id: userId },
        include: [
          {
            model: ExpertSpecialities,
            as: 'userExpertSpecialities', // Alias defined in the Users model
            include: [
              {
                model: Specialities, // Include the related Specialities model
                attributes: ['id', 'title'], // Fetch specific fields from Specialities
              },
            ],
          },
          {
            model: ExpertCaseSpecialities,
            as: 'userExpertCaseSpecialities', // Alias defined in the Users model
            include: [
              {
                model: CaseType, // Include the related Specialities model
                attributes: ['id', 'title'], // Fetch specific fields from Specialities
              },
            ],
          },
          {
            model: ExpertFeeStructure,
            as: 'userExpertFeeStructure', // Alias defined in the Users model
            include: [
              {
                model: CaseType, // Include the related Specialities model
                attributes: ['id', 'title'], // Fetch specific fields from Specialities
              },
            ],
          },
          {
            model: UserDocuments,
            as: 'userDocuments', // Alias defined in the Users model
            attributes: [
              'id',
              'documentType',
              'documentName',
              'description',
              'registerBodyId',
            ],
          },
        ],
      });

      // If user not found
      if (!userData) {
        throw new BadRequestException('User not found');
      }
      let expertCvPath = '';
      let expertRegulatoryFilePath = '';
      let expertRegistrationBodyFilePath = '';
      let registerBodyId = '';
      let expertRegistrationNumberFilePath = '';
      let expertRegistrationNumber = '';
      let expertTrainingFilePath = '';
      let expertTraningDetails = '';
      let expertVatRegistrationFilePath = '';
      let expertVatRegistrationDetails = '';

      let avatarPath = userData?.avatar || '';
      if (userData?.avatar) {
        // Generate the avatar URL
        avatarPath = await this.fileUpload.getFilePath(userData.avatar);
      }

      // Convert user data to JSON
      const userDataJSON = userData.toJSON();
      return {
        ...userDataJSON,
        avatarPath, // Include the avatarPath in the response
        expertCvPath, // Include the expertCvPath in the response
        expertRegulatoryFilePath, // Include the expertRegulatoryFilePath in the response
        expertRegistrationBodyFilePath, // Include the expertRegistrationBodyFilePath in the response
        registerBodyId, // Include the registerBodyId in the response
        expertRegistrationNumberFilePath,
        expertRegistrationNumber,
        expertTrainingFilePath,
        expertTraningDetails,
        expertVatRegistrationDetails,
        expertVatRegistrationFilePath,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateDetails(userId: string, payload: UpdateDetailsDTO) {
    const userData = await this.db.get(Users, {
      where: {
        id: userId,
      },
    });
    userData.firstname = payload.firstname;
    userData.lastname = payload.lastname;
    if (payload.password) {
      userData.password = await this.passwordService.hashPassword(
        payload.password
      );
    }
    await userData.save();

    return userData.toJSON();
  }

  async updateSolicitorProfileDetails(
    userId: string,
    payload: UpdateSolicitorProfileDetailsDTO
  ) {
    //check email is already exist or not
    const emailExist = await this.db.get(Users, {
      where: {
        email: payload.email,
        id: { [Op.not]: userId }, // Use Op.not instead of $not
      },
    });
    if (emailExist) {
      throw new BadRequestException(
        'The email address is already in use, Please enter another one.'
      );
    }

    const userData = await this.db.get(Users, {
      where: {
        id: userId,
      },
    });
    userData.firstname = payload.firstname;
    userData.lastname = payload.lastname;
    userData.email = payload.email;
    userData.phone = payload.phone;
    userData.phoneCode = payload.dial_code;
    userData.countryCode = payload.code;
    userData.postcode = payload.postcode;
    userData.location = payload.location;

    await userData.save();

    let avatarPath = userData?.avatar || '';
    if (userData?.avatar) {
      // generate the avatar url
      avatarPath = await this.fileUpload.getFilePath(userData.avatar);
    }
    return {
      ...userData.toJSON(),
      avatarPath, // Include the avatarPath in the response
    };
  }

  async updateExpertPersonalDetails(
    userId: string,
    payload: updateExpertPersonalDetailsDTO
  ) {
    //check email is already exist or not
    const emailExist = await this.db.get(Users, {
      where: {
        email: payload.email,
        id: { [Op.not]: userId }, // Use Op.not instead of $not
      },
    });
    if (emailExist) {
      throw new BadRequestException(
        'The email address is already in use, Please enter another one.'
      );
    }

    const userData = await this.db.get(Users, {
      where: {
        id: userId,
      },
    });

    userData.firstname = payload.firstname;
    userData.lastname = payload.lastname;
    userData.email = payload.email;
    userData.phone = payload.phone;
    userData.phoneCode = payload.dial_code;
    userData.countryCode = payload.code;
    userData.postcode = payload.postcode;
    userData.location = payload.location;
    userData.city = payload.city;

    await userData.save();
    return;
  }


  async updatePassword(userId: string, payload: UpdatePasswordPayload) {
    const userData = await this.db.get(Users, {
      where: {
        id: userId,
      },
    });

    const isMatchedOldPassword = await this.passwordService.validatePassword(
      payload.currentPassword,
      userData.password
    );

    if (!isMatchedOldPassword) {
      throw new HttpException(
        {
          message: `Current password didn't match.`,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    if (payload.newPassword) {
      userData.password = await this.passwordService.hashPassword(
        payload.newPassword
      );
    }
    await userData.save();

    return {
      fullname: `${userData.firstname} ${userData.lastname}`,
      id: userData.id,
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      phone: userData.phone,
    };
  }

  async updatePersonalDetails(
    userId: string,
    payload: UpdatePersonalDetailsDTO
  ) {
    const userData = await this.db.getByPk(Users, userId, {
      attributes: [
        'id',
        'fullname',
        'firstname',
        'lastname',
        'email',
        'phone',
        'phoneCode',
        'countryCode',
      ],
    });

    // validateCountryCodeAndDialCode(payload.code, payload.dial_code);

    userData.firstname = payload.firstname;
    userData.lastname = payload.lastname;
    userData.phone = payload.phone;
    userData.phoneCode = payload.dial_code;
    userData.countryCode = payload.code;

    await userData.save();

    return userData.toJSON();
  }

  async generateOtp(payload: GenerateOtpDTO) {
    try {
      if (!payload.email) {
        throw new BadRequestException('Please enter email address.');
      }

      // Convert the email to lowercase
      payload.email = payload.email.toLowerCase();

      const otpType = payload.otpType; // signup | forgotpassword | login
      const userWhere = { email: payload.email, isDeleted: false };
      const user = await this.db.get(Users, { where: userWhere });
      if (!user) {
        throw new BadRequestException(
          'This email address is not registered with us. Please try using a different one.'
        );
      }

      const otpWhere = { email: payload.email };
      const otpuser = await this.db.get(Otp, { where: otpWhere });

      const otp = generateOTP();
      const currentTime = new Date();

      if (otpuser) {
        otpuser.otp = otp;
        otpuser.otpSendTime = currentTime;
        await otpuser.save();
      } else {
        await this.db.create(Otp, {
          email: payload.email,
          otp: otp,
          otpSendTime: currentTime,
        });
      }

      const clientUrl = process.env.CLIENT_URL;
      const logoUrl = `${clientUrl}assets/images/logo_copy.png`;

      await this.emailService.sendEmail({
        template: 'user.generateOtp',
        slug: 'generate-otp',
        email: payload.email,
        subject: 'Generate OTP',
        body: {
          email: payload.email,
          otp: otp,
          logoUrl: logoUrl,
          fullName: `${user.firstname} ${user.lastname || ''}`,
        },
      });
      return { otpType: otpType, email: payload.email };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An unexpected error occurred.'
      );
    }
  }

  async generateOtpAdmin(payload: GenerateOtpDTO) {
    try {
      if (!payload.email) {
        throw new BadRequestException('Please enter email address.');
      }

      // Convert the email to lowercase
      payload.email = payload.email.toLowerCase();

      const otpType = payload.otpType; // signup | forgotpassword | login
      const userWhere = { email: payload.email, isDeleted: false };
      const user = await this.db.get(Users, { where: userWhere });
      if (!user) {
        throw new BadRequestException(
          'This email address is not registered with us. Please try using a different one.'
        );
      }

      const otpWhere = { email: payload.email };
      const otpuser = await this.db.get(Otp, { where: otpWhere });

      const otp = generateOTP();
      const currentTime = new Date();

      if (otpuser) {
        otpuser.otp = otp;
        otpuser.otpSendTime = currentTime;
        await otpuser.save();
      } else {
        await this.db.create(Otp, {
          email: payload.email,
          otp: otp,
          otpSendTime: currentTime,
        });
      }

      const clientUrl = process.env.CLIENT_URL;
      const logoUrl = `${clientUrl}assets/images/logo_copy.png`;

      await this.emailService.sendEmail({
        template: 'user.generateOtp',
        slug: 'generate-otp',
        email: payload.email,
        subject: 'Generate OTP',
        body: {
          email: payload.email,
          otp: otp,
          logoUrl: logoUrl,
          fullName: `${user.firstname} ${user.lastname || ''}`,
        },
      });
      return { otpType: otpType, email: payload.email };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An unexpected error occurred.'
      );
    }
  }

  public async verifyOTP(payload: VerifyOtpDTO) {
    try {
      payload.email = payload.email.toLowerCase();

      const where = {
        email: payload.email,
      };
      const OTP = await this.db.get(Otp, { where });
      if (!OTP) {
        throw new BadRequestException(
          'The email address you entered is incorrect.'
        );
      }
      if (!OTP.otp) {
        throw new BadRequestException('The verification code not found');
      }
      if (OTP.otp === payload.otp) {
        const currentTime = new Date();
        const otpSendTime = new Date(OTP.otpSendTime);

        const diffSeconds = Math.floor(
          (currentTime.getTime() - otpSendTime.getTime()) / 1000
        );

        if (diffSeconds > 300) {
          throw new BadRequestException('OTP has been expired.');
        }
        if (payload.email && payload.otpType == 'signup') {
          const userData = await this.db.get(Users, {
            where: {
              email: payload.email,
            },
          });
          userData.isUserEmailVerify = true;
          userData.save();

          const clientUrl = process.env.CLIENT_URL;
          const logoUrl = `${clientUrl}assets/images/logo_copy.png`;

          this.emailService.sendEmail({
            template: 'user.userWelcome',
            slug: 'user-welcome',
            email: payload.email,
            subject: `Welcome to the Expert Witness Gateway`,
            body: {
              fullName: `${userData?.firstname} ${userData?.lastname || 'Sir'}`,
              logoUrl: logoUrl,
            },
          });
          const tokendata = await encrypt({ email: payload.email });
          return { otpToken: tokendata, otpType: payload.otpType };
        } else if (payload.otpType == 'login') {
          const userDetails = await this.db.get(Users, {
            where: {
              email: payload.email,
            },
          });
          userDetails.isUserEmailVerify = true;
          userDetails.save();

          const lastLoginTime = formatDate(null, null, true);
          // Generate auth token and update user info
          const payloadjwt: IPayloadUserJwt = {
            userId: userDetails.id,
            rememberme: true,
            lastLogin: lastLoginTime,
          };
          const authToken =
            await this.passwordService.generateAuthTokenFromLogin(payloadjwt);

          const query = {
            attributes: [
              'id',
              'fullname',
              'firstname',
              'lastname',
              'email',
              'phone',
              'phoneCode',
              'role',
              'avatar',
              'location',
              'postcode',
              'totalExperience',
              'isProfileSetup',
              'isUserEmailVerify',
              //'bio',
              'experienceDetails',
              'countryCode',
            ],
          };
          const userInfo = await this.db.getByPk(Users, userDetails.id, query);
          const tokendata = await encrypt({ email: payload.email });
          return {
            ...userInfo.toJSON(),
            accessToken: authToken?.accessToken,
            refreshToken: authToken?.refreshToken,
            lastLogin: lastLoginTime,
            otpToken: tokendata,
            otpType: payload.otpType,
          };
        } else {
          const tokendata = await encrypt({ email: payload.email });
          return { otpToken: tokendata, otpType: payload.otpType };
        }
      } else {
        throw new BadRequestException(
          'The verification code you entered is incorrect.'
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  public async verifyOTPAdmin(payload: VerifyOtpDTO) {
    try {
      payload.email = payload.email.toLowerCase();

      const where = {
        email: payload.email,
      };
      const OTP = await this.db.get(Otp, { where });
      if (!OTP) {
        throw new BadRequestException(
          'The email address you entered is incorrect.'
        );
      }
      if (!OTP.otp) {
        throw new BadRequestException('The verification code is not found');
      }
      if (OTP.otp === payload.otp) {
        const currentTime = new Date();
        const otpSendTime = new Date(OTP.otpSendTime);

        const diffSeconds = Math.floor(
          (currentTime.getTime() - otpSendTime.getTime()) / 1000
        );

        if (diffSeconds > 300) {
          throw new BadRequestException(
            'The verification code has been expired.'
          );
        }
        if (payload.email && payload.otpType == 'signup') {
          const userData = await this.db.get(Users, {
            where: {
              email: payload.email,
            },
          });
          userData.isUserEmailVerify = true;
          userData.save();

          const clientUrl = process.env.CLIENT_URL;
          const logoUrl = `${clientUrl}assets/images/logo_copy.png`;

          this.emailService.sendEmail({
            template: 'user.userWelcome',
            slug: 'user-welcome',
            email: payload.email,
            subject: `Welcome to the Expert Witness Gateway`,
            body: {
              fullName: `${userData?.firstname} ${userData?.lastname || 'Sir'}`,
              logoUrl: logoUrl,
            },
          });
          const tokendata = await encrypt({ email: payload.email });
          return { otpToken: tokendata, otpType: payload.otpType };
        } else if (payload.otpType == 'login') {
          const userDetails = await this.db.get(Users, {
            where: {
              email: payload.email,
            },
          });
          userDetails.isUserEmailVerify = true;
          userDetails.save();

          const lastLoginTime = formatDate(null, null, true);
          // Generate auth token and update user info
          const payloadjwt: IPayloadUserJwt = {
            userId: userDetails.id,
            rememberme: true,
            lastLogin: lastLoginTime,
          };
          const authToken =
            await this.passwordService.generateAuthTokenFromLogin(payloadjwt);

          const query = {
            attributes: [
              'id',
              'fullname',
              'firstname',
              'lastname',
              'email',
              'phone',
              'phoneCode',
              'role',
              'avatar',
              'location',
              'postcode',
              'totalExperience',
              'isProfileSetup',
              'isUserEmailVerify',
              //'bio',
              'experienceDetails',
              'countryCode',
            ],
          };
          const userInfo = await this.db.getByPk(Users, userDetails.id, query);
          const tokendata = await encrypt({ email: payload.email });
          return {
            ...userInfo.toJSON(),
            accessToken: authToken?.accessToken,
            refreshToken: authToken?.refreshToken,
            lastLogin: lastLoginTime,
            otpToken: tokendata,
            otpType: payload.otpType,
          };
        } else {
          const tokendata = await encrypt({ email: payload.email });
          return { otpToken: tokendata, otpType: payload.otpType };
        }
      } else {
        throw new BadRequestException(
          'You have entered an incorrect verification code.'
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteAccount(userId: string) {
    try {
      const userData = await this.db.get(Users, {
        where: {
          id: userId,
        },
      });
      userData.isDeleted = true;
      userData.save();

      return 'Account Deleted Successfully';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async signup(payload: SignupDTO) {
    try {
      if (!payload.email) {
        throw new BadRequestException('Email is required.');
      }

      payload.email = payload.email.toLowerCase();

      const findUser = await this.db.get(Users, {
        where: { email: payload.email },
        paranoid: false,
      });

      if (findUser) {
        if (findUser.email === payload.email && !findUser.isDeleted) {
          throw new BadRequestException('Email address is already in use.');
        } else if (findUser.isDeleted) {
          throw new BadRequestException(
            'Your account has been deleted. Please contact the administrator for assistance.'
          );
        }
      }

      //validateCountryCodeAndDialCode(payload.code, payload.dial_code);

      const hashedPassword = await this.passwordService.hashPassword(
        payload.password
      );
      const lastLoginTime = formatDate(null, null, true);
      const createPayload = {
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: payload.email,
        password: hashedPassword,
        phone: payload.phone,
        phoneCode: payload.dial_code,
        countryCode: payload.code,
        role: payload.role,
        status: true,
        postcode: payload.postcode,
        companyName: payload?.companyname || '',
        location: payload.location,
        lastLogin: lastLoginTime,
      };

      const userData = await this.db.create(Users, createPayload);

      const tokenPayload: IPayloadUserJwt = {
        userId: userData.id,
        role: payload.role,
        lastLogin: lastLoginTime,
      };

      const [authToken, user] = await Promise.all([
        this.passwordService.generateAuthTokenFromLogin(tokenPayload),
        this.db.getByPk(Users, userData.id, {
          attributes: [
            'id',
            'fullname',
            'firstname',
            'lastname',
            'email',
            'phone',
            'phoneCode',
            'countryCode',
            'lastLogin',
            'location',
            'postcode',
            'isUserEmailVerify',
            'status',
            'isProfileSetup',
            'approvalStatus',
          ],
        }),
      ]);
      return {
        ...user.toJSON(),
        accessToken: authToken?.accessToken,
        refreshToken: authToken?.refreshToken,
        lastLogin: lastLoginTime,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An unexpected error occurred during signup.'
      );
    }
  }

  // async updateAvatarOld(
  //   parameter: UpdateAvatarDto,
  //   avatarFile: Express.Multer.File
  // ) {
  //   const avatarUploadObj = {
  //     avatar: 'avatar/'+avatarFile.originalname,
  //     id: parameter.id,
  //   } as {
  //     avatar: string;
  //     id: string;
  //     avatarURL?: string;
  //   };
  //   // If a file is uploaded, update the avatar URL with the new file
  //   if (avatarFile) {
  //     avatarUploadObj.avatarURL = (
  //       await this.fileUpload.uploadFile(avatarFile, parameter.id, 'avatar', avatarUploadObj.avatar)
  //     )?.replaceAll('\\', '/');
  //   }
  //   //console.log(avatarUploadObj);
  //   // Update the avatar in the database using the provided data
  //   const [dbResult] = await this.db.update(Users, avatarUploadObj, {
  //     where: { id: parameter.id },
  //   });

  //   // Return success message if the document was updated
  //   if (dbResult > 0) {
  //     // Fetch the user data from the database
  //     const userData = await this.db.get(Users, { where: { id: parameter.id } });

  //     let avatarPath = userData?.avatar || '';
  //     if(userData?.avatar) {
  //       // generate the avatar url
  //       avatarPath = await this.fileUpload.getFilePath(userData.avatar);
  //     }
  //     // Convert user data to JSON
  //     const userDataJSON = userData.toJSON();
  //     return {
  //       userDetails: {
  //         ...userDataJSON,
  //         avatarPath, // Include the avatarPath in the response
  //       },
  //       message: 'User avatar updated successfully!'
  //     };
  //   }
  // }

  async updateAvatar(
    parameter: UpdateAvatarDto,
    avatarFile: Express.Multer.File
  ) {
    try {
      // Generate a new file name using the current timestamp with milliseconds
      const timestamp = Date.now(); // Current timestamp in milliseconds
      const fileExtension = path.extname(avatarFile.originalname); // Get the file extension
      const randomSixDigit = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit number
      const newFileName = `avatar/${randomSixDigit}_${timestamp}${fileExtension}`; // New file name

      const avatarUploadObj = {
        avatar: newFileName,
        id: parameter.id,
        avatarURL: '',
      };

      // If a file is uploaded, upload it to S3 with the new file name
      if (avatarFile) {
        avatarUploadObj.avatarURL = (
          await this.fileUpload.uploadFile(avatarFile, newFileName)
        )?.replaceAll('\\', '/');
      }

      // Update the avatar in the database using the new file name
      const [dbResult] = await this.db.update(Users, avatarUploadObj, {
        where: { id: parameter.id },
      });

      // Return success message if the document was updated
      if (dbResult > 0) {
        // Fetch the user data from the database
        const userData = await this.db.get(Users, {
          where: { id: parameter.id },
        });

        let avatarPath = userData?.avatar || '';
        if (userData?.avatar) {
          // Generate the avatar URL
          avatarPath = await this.fileUpload.getFilePath(userData.avatar);
        }

        // Convert user data to JSON
        const userDataJSON = userData.toJSON();
        return {
          userDetails: {
            ...userDataJSON,
            avatarPath, // Include the avatarPath in the response
          },
          message: 'User avatar updated successfully!',
        };
      } else {
        throw new BadRequestException('Failed to update avatar.');
      }
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while updating the avatar.'
      );
    }
  }
}
