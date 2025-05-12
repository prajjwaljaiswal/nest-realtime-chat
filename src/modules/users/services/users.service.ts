import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ROLES as USER_ROLES } from '@common/global-interfaces';
import * as fs from 'fs';
import * as path from 'path';

import {
  CreateMobileUserDTO,
  CreateUserDTO,
  DeleteUserDTO,
  GetAllUsersDTO,
  UpdateMobileUserDTO,
  UpdateUserDTO,
  UserStatusDTO,
  ApprovalUserDTO,
} from '../dto/users.dto';
import {
  encrypt,
  generateRandomPassword,
  searchingAllFields,
  // validateCountryCodeAndDialCode,
} from '@common/global-helpers/all.helpers';
import { PasswordService } from '@modules/auth/services/password.service';
import { EmailService } from '@providers/email/email.service';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '@common/constants/global.constants';
import { GetResponse, ROLES } from '@common/global-interfaces';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { Users } from '@src/models/user.model';
import { literal, Op } from 'sequelize';
import { CMS } from '@src/models/cmsPages.model';
import { Enquiry } from '@src/models/enquiry.model';
import { CaseSolicitors } from '@src/models/caseSolicitors.model';
import { CaseExperts } from '@src/models/caseExperts.model';
import { UserDocuments } from '@src/models/userDocuments.model';
//import { Industry } from '@src/models/Industry.model';

@Injectable()
export class UserService {
  private selectFields: any;
  constructor(
    private passwordService: PasswordService,
    private emailService: EmailService,
    private db: SeqeulizeService
  ) {
    this.selectFields = [
      'id',
      'firstname',
      'lastname',
      'email',
      'phone',
      'phoneCode',
      'countryCode',
      'location',
      'postcode',
      'companyName',
      'role',
      'lastLogin',
      'isUserEmailVerify',
      'approvalStatus',
      'experienceDetails',
      'status',
      'createdAt',
      'updatedAt',
      'fullname',
    ];
  }

  async getAllUsers(
    userId: string,
    payload: GetAllUsersDTO,
  ) {
    try {
      const page = payload?.page || DEFAULT_PAGE;
      const limit = Number(payload?.limit) || DEFAULT_LIMIT;

      let whereCondition: any = {
        isDeleted: false
      };

      const includeClause: any[] = [];


      const { rows: data, count } = await this.db.findAndCount(Users, {
        attributes: this.selectFields,
        where: whereCondition,
        include: includeClause,
        limit,
        offset: limit * (page - 1)
      });

      const result: GetResponse = {
        page: page,
        limit: limit,
        total: count,
        result: data,
      };
      return result;
    } catch (error: any) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  async createMobileUser(payload: CreateMobileUserDTO) {
    try {
      const emailLower = payload.email.toLowerCase();

      const userCheck = await this.db.get(Users, {
        where: { email: emailLower, isDeleted: false },
      });

      if (userCheck) {
        throw new BadRequestException('User with this email already exists.');
      }
      // const randomNumbers = generateOTP();
      const password = generateRandomPassword();

      const hashedPassword = await this.passwordService.hashPassword(password);

      // validateCountryCodeAndDialCode(payload.code, payload.dial_code);

      const createPayload = {
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: emailLower,
        password: hashedPassword,
        phone: payload.phone,
        phoneCode: payload.dial_code,
        countryCode: payload.code,
        role: payload.role,
        isUserEmailVerify: true,
      };

      await this.db.create(Users, createPayload);

      const clientUrl = process.env.CLIENT_URL;
      const logoUrl = `${clientUrl}assets/images/logo_copy.png`;

      this.emailService.sendEmail({
        template: 'user.mobilewelcome',
        slug: 'welcome-user',
        email: emailLower,
        subject: 'Welcome Base User',
        body: {
          name: `${payload.firstname} ${payload.lastname || ''}`,
          email: emailLower,
          currentPassword: password,
          logoUrl: logoUrl,
        },
      });

      return { message: 'User successfully created and email sent.' };
    } catch (error: any) {
      console.error('Error in createMobileUser:', error.message || error);

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || 'An error occurred while creating the user.'
      );
    }
  }

  async createUser(payload: CreateUserDTO) {
    try {
      const emailLower = payload.email.toLowerCase();

      const clientUrl = process.env.CLIENT_URL;

      const [findUserEmail, findUserPhone] = await Promise.all([
        this.db.get(Users, {
          where: {
            email: emailLower, // Use the lowercase email for the check
          },
        }),
        payload.phone
          ? this.db.getAll(Users, {
              where: { phone: payload.phone.toString() },
            })
          : [],
      ]);

      if (findUserEmail)
        throw new BadRequestException('User Email Already Exists');
      if (findUserPhone.length)
        throw new BadRequestException(
          'This phone is already connected to another account'
        );

      const token = encrypt({ email: emailLower });

      const createPayload: { [key: string]: any; role: ROLES } = {
        ...payload,
        phoneCode: payload.dial_code,
        countryCode: payload.code,
        email: emailLower,
        auth: { token, tokenTimeout: new Date().toISOString() },
      };

      if (payload.password) {
        const hashedPassword = await this.passwordService.hashPassword(
          payload.password
        );
        createPayload['password'] = hashedPassword;
      } else {
        createPayload['password'] = '';
      }

      console.log(createPayload, 'payload');

      const user = await this.db.create(Users, createPayload);

      const logoUrl = `${clientUrl}assets/images/logo_copy.png`;

      this.emailService.sendEmail({
        template: 'user.verifyUser',
        slug: 'verify-user',
        email: emailLower,
        subject: 'Verify user',
        body: {
          url: `${clientUrl}create-password?token=${token}`,
          name: `${payload.firstname} ${payload.lastname || ''}`,
          email: emailLower,
          logoUrl: logoUrl,
        },
      });

      return user.toJSON();
    } catch (error: any) {
      throw error;
    }
  }

  async updatePassword(payload: { id: string; updatedPayload: object }) {
    const isUpdated = await this.db.update(Users, payload.updatedPayload, {
      where: { id: payload.id },
    });
    return isUpdated;
  }

  async updateUser(id: string, payload: UpdateUserDTO) {
    // Convert the email to lowercase if it's provided
    if (payload.email) {
      payload.email = payload.email.toLowerCase();
    }

    // Check for existing user, phone, and email (with exclusions for current user)

    const findResponse = await this.db.get(Users, {
      where: {
        id,
      },
    });

    if (!findResponse) throw new BadRequestException('No user found');

    // Use Promise.all to fetch phone and email data only if they're provided and changed
    const [findPhone, findEmail] = await Promise.all([
      payload.phone && payload.phone !== findResponse.phone // Check if the phone is being updated
        ? this.db.getAll(Users, {
            where: { phone: payload.phone.toString(), id: { [Op.not]: id } },
          })
        : [],
      payload.email && payload.email !== findResponse.email // Check if the email is being updated
        ? this.db.getAll(Users, {
            where: { email: payload.email, id: { [Op.not]: id } },
          })
        : [],
    ]);

    if (!findResponse) throw new BadRequestException('No user found');

    // Check if phone is already linked to another user
    if (findPhone && findPhone.length) {
      throw new BadRequestException(
        `This phone is already connected to another account.`
      );
    }

    // Check if email is already linked to another user
    if (findEmail && findEmail.length) {
      throw new BadRequestException(
        `This email is already connected to another account.`
      );
    }

    const whereCondition = {
      id: findResponse.id,
    };

    const user = await this.db.update(
      Users,
      { ...payload, phoneCode: payload.dial_code, countryCode: payload.code },
      {
        where: whereCondition,
        returning: true,
      }
    );

    return user;
  }

  async updateMobileUser(id: string, payload: UpdateMobileUserDTO) {
    if (payload.email) {
      payload.email = payload.email.toLowerCase();
    }

    const findResponse = await this.db.get(Users, {
      where: {
        id,
      },
    });

    if (!findResponse) throw new BadRequestException('No user found');

    // Use Promise.all to fetch phone and email data only if they're provided and changed
    const [findPhone, findEmail] = await Promise.all([
      payload.phone && payload.phone !== findResponse.phone // Check if the phone is being updated
        ? this.db.getAll(Users, {
            where: { phone: payload.phone.toString(), id: { [Op.not]: id } },
          })
        : [],
      payload.email && payload.email !== findResponse.email // Check if the email is being updated
        ? this.db.getAll(Users, {
            where: { email: payload.email, id: { [Op.not]: id } },
          })
        : [],
    ]);

    // Check if the phone is already associated with another account
    if (findPhone && findPhone.length) {
      throw new BadRequestException(
        `This phone is already connected to another account.`
      );
    }

    // Check if the email is already associated with another account
    if (findEmail && findEmail.length) {
      throw new BadRequestException(
        `This email is already connected to another account.`
      );
    }

    const whereCondition = {
      id: findResponse.id,
    };

    const userPayload = {
      firstname: payload.firstname,
      lastname: payload.lastname,
      phone: payload.phone,
      phoneCode: payload.dial_code,
      countryCode: payload.code,
    };

    // Update user data (phone, firstname, lastname)
    const user = await this.db.update(Users, userPayload, {
      where: whereCondition,
      returning: true,
    });

    return user;
  }

  async updateStatus(payload: UserStatusDTO) {
    try {
      const user = await this.db.get(Users, {
        where: {
          id: payload.id,
        },
      });
      user.status = !user.status;
      await user.save();
      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  // async updateApprovalStatus(payload: ApprovalUserDTO) {
  //   try {
  //     const user = await this.db.get(Users, {
  //       where: {
  //         id: payload.id,
  //       },
  //     });
  //     user.approvalStatus = payload.approvalStatus;

  //     user.rejectionComments = payload.rejectionComments;
  //     console.log('Updating approval status:', {
  //       id: payload.id,
  //       approvalStatus: payload.approvalStatus,
  //       rejectionComments: payload.rejectionComments,
  //     });
  //     await user.save();
  //     return user.toJSON();
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async updateApprovalStatus(payload: ApprovalUserDTO) {
    try {
      // Ensure the primary key (id) and required fields are included in the query
      const user = await this.db.get(Users, {
        attributes: [
          'id',
          'role',
          'firstname',
          'lastname',
          'email',
          'approvalStatus',
          'rejectionComments',
        ],
        where: {
          id: payload.id,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Update the user instance
      user.approvalStatus = payload.approvalStatus;
      user.rejectionComments = payload.rejectionComments;

      console.log('Updating approval status:', {
        id: payload.id,
        approvalStatus: payload.approvalStatus,
        rejectionComments: payload.rejectionComments,
      });

      // Save the updated user instance
      await user.save();

      const clientUrl = process.env.CLIENT_URL;
      const logoUrl = `${clientUrl}assets/images/logo_copy.png`;

      // Determine the email template, slug, and subject based on role and approval status
      let template = '';
      let slug = '';
      let subject = '';

      if (payload.approvalStatus === 'APPROVED') {
        if (user.role === 'EXPERT') {
          template = 'expert-account-approval-notification';
          slug = 'expert-account-approval-notification';
          subject = 'Your Expert Account Has Been Approved';
        } else if (user.role === 'SOLICITOR') {
          template = 'solicitor-account-approval-notification';
          slug = 'solicitor-account-approval-notification';
          subject = 'Your Solicitor Account Has Been Approved';
        }
      } else if (payload.approvalStatus === 'REJECTED') {
        template = 'reject-user-account';
        slug = 'reject-user-account';
        subject = 'Your Account Has Been Rejected';
      }
      console.log('---------', `${user.firstname} ${user.lastname || ''}`);

      // Send email notification if a valid template and slug are determined
      if (template && slug) {
        this.emailService.sendEmail({
          template: template,
          slug: slug,
          email: user.email,
          subject: subject,
          body: {
            fullName: `${user.firstname} ${user.lastname || ''}`, // Full name
            email: user.email,
            rejectionComments: payload.rejectionComments || '', // Rejection reason
            logoUrl: logoUrl,
          },
        });
      }

      return user.toJSON();
    } catch (error) {
      console.error('Error in updateApprovalStatus:', error);
      throw error;
    }
  }
  async delete(payload: DeleteUserDTO) {
    try {
      if (!payload?.id.length) {
        throw new BadRequestException('User Id not found');
      }
      const count = await this.db.count(Users, {
        where: {
          id: { [Op.in]: payload?.id },
        },
      });
      if (count !== payload?.id.length) {
        throw new BadRequestException('No user found');
      }
      await this.db.delete(Users, {
        where: {
          id: { [Op.in]: payload?.id },
        },
        cascade: true,
      });
      // await this.db.delete(Doctors, {
      //   where: {
      //     userId: { [Op.in]: payload?.id },
      //   },
      // });
      // await this.db.delete(Users, {
      //   where: {
      //     id: { [Op.in]: payload?.id },
      //   },
      // });
      return {
        message: 'User deleted successfully!',
      };
    } catch (error: any) {
      throw error;
    }
  }

  async deleteUser(payload: DeleteUserDTO) {
    try {
      // Step 1: Validate user ID
      if (!payload?.id?.length) {
        throw new BadRequestException('User Id not found');
      }

      // Step 2: Fetch user by ID
      const userData = await this.db.get(Users, {
        where: { id: payload.id },
      });

      if (!userData) {
        throw new BadRequestException('User not found');
      }

      // Step 3: Role-based case association check
      if (userData.role === 'EXPERT') {
        const associatedCase = await this.db.get(CaseExperts, {
          where: { expertId: payload.id },
        });

        if (associatedCase) {
          throw new BadRequestException(
            'This user is associated with a case as an expert and cannot be deleted.'
          );
        } else {
          // No case found → proceed with delete
          return await Promise.all(
            payload.id.map((id) => this.performUserDeletion(id, userData))
          );
        }
      } else if (userData.role === 'SOLICITOR') {
        const associatedCase = await this.db.get(CaseSolicitors, {
          where: { solicitorId: payload.id },
        });

        if (associatedCase) {
          throw new BadRequestException(
            'This user is associated with a case as a solicitor and cannot be deleted.'
          );
        } else {
          // No case found → proceed with delete
          return await Promise.all(
            payload.id.map((id) => this.performUserDeletion(id, userData))
          );
        }
      } else {
        // For other roles → delete directly
        return await Promise.all(
          payload.id.map((id) => this.performUserDeletion(id, userData))
        );
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Helper method to handle deletion
  private async performUserDeletion(userId: string, userData: any) {
    // Mark user as deleted (soft delete)
    userData.isDeleted = true;
    await userData.save();

    // Force delete user documents
    await this.db.delete(UserDocuments, {
      where: { userId },
      force: true,
    });

    // Force delete the user
    await this.db.delete(Users, {
      where: { id: userId },
      force: true,
    });

    return {
      message: 'User has been deleted successfully!',
    };
  }

  async getTotalCount() {
    try {
      // Count users grouped by role
      const roles = ['EXPERT', 'SOLICITOR'];
      const userCounts = await Promise.all(
        roles.map(async (role) => {
          const { count } = await this.db.findAndCount(Users, {
            where: { role, isDeleted: false },
          });
          return { [role.toLowerCase() + 's']: count };
        })
      );

      // Convert user counts array to object
      const userStats = Object.assign({}, ...userCounts);

      // Count cases by status
      // const caseStatuses = ["OPEN", "IN_PROGRESS", "CLOSED"];
      // const caseCounts = await Promise.all(
      //   caseStatuses.map(async (status) => {
      //     const { count } = await this.db.findAndCount(Cases, { where: { status } });
      //     return { [status.toLowerCase()]: count };
      //   })
      // );

      // const caseStats = Object.assign({}, ...caseCounts, {
      //   total: caseCounts.reduce((acc, obj) => acc + Object.values(obj)[0], 0),
      // });

      // Count financial statistics
      // const totalInvoices = await this.db.count(Invoices);
      // const commissionEarned = await this.db.sum(Invoices, "commission");
      // const amountPaid = await this.db.sum(Invoices, "paidAmount");
      // const amountPending = await this.db.sum(Invoices, "pendingAmount");

      // Revenue trends (mocking past 7/30 days revenue)
      const last7DaysRevenue = [1000, 1200, 800, 1100, 950, 1300, 900]; // Replace with actual DB logic
      const last30DaysRevenue = [10000, 12000, 8000, 11000, 9500, 13000, 9000];

      return {
        users: userStats,
        cases: { total: 200, open: 50, inProgress: 100, closed: 50 },
        invoices: { total: 500, commission: 20000, paid: 15000, pending: 5000 },
        revenue: { last7Days: last7DaysRevenue, last30Days: last30DaysRevenue },
      };
    } catch (error: any) {
      console.error('Error in getTotalCount:', error);
      throw error;
    }
  }

  async getTotalCountweb(user: Users) {
    try {
      console.log('user-----', user);

      // Fetch role and id from DB (safe fresh fetch)
      const userData = await this.db.getByPk(Users, user.id, {
        attributes: ['id', 'role'],
      });

      const last7DaysRevenue = [1000, 1200, 800, 1100, 950, 1300, 900];
      const last30DaysRevenue = [10000, 12000, 8000, 11000, 9500, 13000, 9000];

      // If the user is an expert, return expert-specific case stats for that expert only
      let expertStats = null;
      if (userData.role === 'EXPERT') {
        const [totalPendingCases, totalAcceptedCases] = await Promise.all([
          this.db.count(CaseExperts, {
            where: {
              invitationStatus: 'PENDING',
              expertId: userData.id,
            },
          }),
          this.db.count(CaseExperts, {
            where: {
              invitationStatus: 'ACCEPTED',
              llaStatus: 'ACCEPTED',
              expertId: userData.id,
            },
          }),
        ]);

        const { lastWeekTotalPendingCases, lastWeekTotalAcceptedCases } =
          await this.getLastWeekCounts(userData.id); // pass expertId

        const { currentWeekTotalPendingCases, currentWeekTotalAcceptedCases } =
          await this.getCurrentWeekCounts(userData.id); // pass expertId

        const pendingCaseGrowth =
          lastWeekTotalPendingCases > 0
            ? ((currentWeekTotalPendingCases - lastWeekTotalPendingCases) /
                lastWeekTotalPendingCases) *
              100
            : 0;

        const acceptedCaseGrowth =
          lastWeekTotalAcceptedCases > 0
            ? ((currentWeekTotalAcceptedCases - lastWeekTotalAcceptedCases) /
                lastWeekTotalAcceptedCases) *
              100
            : 0;

        expertStats = {
          cases: {
            total: 200, // Optional: replace with dynamic count if needed
            open: 50,
            inProgress: 100,
            closed: 50,
          },
          invoices: {
            total: 500,
            commission: 20000,
            paid: 15000,
            pending: 5000,
          },
          revenue: {
            last7Days: last7DaysRevenue,
            last30Days: last30DaysRevenue,
          },
          stats: {
            totalPendingCases,
            totalAcceptedCases,
            pendingCaseGrowth,
            acceptedCaseGrowth,
          },
        };
      }

      return {
        expert: expertStats,
        solicitor: {
          cases: {
            total: 200,
            open: 50,
            inProgress: 100,
            closed: 50,
          },
          invoices: {
            total: 500,
            commission: 20000,
            paid: 15000,
            pending: 5000,
          },
          revenue: {
            last7Days: last7DaysRevenue,
            last30Days: last30DaysRevenue,
          },
        },
      };
    } catch (error) {
      console.error('Error in getTotalCountweb:', error);
      throw error;
    }
  }

  private async getLastWeekCounts(id: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 14);

    const lastWeekTotalPendingCases = await this.db.count(CaseExperts, {
      where: {
        invitationStatus: 'PENDING',
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    const lastWeekTotalAcceptedCases = await this.db.count(CaseExperts, {
      where: {
        invitationStatus: 'ACCEPTED',
        llaStatus: 'ACCEPTED',
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    return { lastWeekTotalPendingCases, lastWeekTotalAcceptedCases };
  }

  private async getCurrentWeekCounts(id: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const currentWeekTotalPendingCases = await this.db.count(CaseExperts, {
      where: {
        invitationStatus: 'PENDING',
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    const currentWeekTotalAcceptedCases = await this.db.count(CaseExperts, {
      where: {
        invitationStatus: 'ACCEPTED',
        llaStatus: 'ACCEPTED',
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    return {
      currentWeekTotalPendingCases,
      currentWeekTotalAcceptedCases,
    };
  }

  async downloadCSVFile(): Promise<string> {
    try {
      const filePath = path.join(
        process.cwd(),
        'public',
        'uploads',
        'csvFile.csv'
      );

      if (!fs.existsSync(filePath)) {
        throw new BadRequestException('File not found');
      }

      return filePath;
    } catch (error) {
      console.error('Error in downloadCSVFile:', error);
      throw error;
    }
  }
}
// const { rows: data, count } = await this.db.findAndCount(Users, {
//   attributes: this.selectFields,
//   where: whereCondition,
//   include: includeClause,
//   limit,
//   offset: limit * (page - 1),
//   order: [[sortField, sortOrder]],
// });
