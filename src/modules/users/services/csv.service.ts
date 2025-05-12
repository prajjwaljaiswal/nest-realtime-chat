import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { parse } from 'csv-parse';
import { PasswordService } from '@modules/auth/services/password.service';
import { EmailService } from '@providers/email/email.service';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import {
  generateRandomPassword,
  validateEmail,
  validateMobileNumber,
} from '@common/global-helpers/all.helpers';
import { Users } from '@src/models/user.model';
import { ROLES, ROLES as USER_ROLES } from '@common/global-interfaces';
import { roles } from '@src/roles';

@Injectable()
export class CsvService {
  private readonly requiredColumns = [
    'firstname',
    'lastname',
    'email',
    'phone',
    'dial_code',
    'jobtitle',
    'location',
  ];

  constructor(
    private passwordService: PasswordService,
    private emailService: EmailService,
    private db: SeqeulizeService
  ) {}

  async processFileAndAddUsers(filePath: string, companyId: string) {
    const extension = filePath.split('.').pop()?.toLowerCase();
    try {
      if (extension === 'csv') {
        await this.processCsv(filePath, companyId);
      } else if (extension === 'xlsx' || extension === 'xls') {
        await this.processExcel(filePath, companyId);
      }
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }

  private async processCsv(filePath: string, companyId: string) {
    await new Promise((resolve, reject) => {
      const parser = fs.createReadStream(filePath).pipe(
        parse({
          columns: true,
          trim: true,
          skip_empty_lines: true,
        })
      );

      let allCount = 0;
      const failedUsers = [];
      const promises = []; // To hold promises for each `addUsers` call

      parser.on('data', (row) => {
        allCount += 1;

        // Create a promise for each `addUsers` call
        const userAddPromise = this.addUsers({ ...row, companyId })
          .then((isUserAdded) => {
            if (isUserAdded && isUserAdded?.status === false) {
              if (isUserAdded.user) {
                failedUsers.push(isUserAdded.user);
              }
            }
          })
          .catch((error) => {
            // Optionally handle errors for each `addUsers` call here
            console.error('Error adding user:', error);
          });

        promises.push(userAddPromise); // Add the promise to the array
      });

      parser.on('end', async () => {
        // Wait for all user add operations to finish
        try {
          await Promise.all(promises);

          // Send Email
          const superUser = await this.db.get(Users, {
            where: {
              role: 'SUPERADMIN',
            },
          });
          if (superUser) {
            if (failedUsers?.length) {
              this.emailService.sendEmail({
                template: 'faileduser.notification',
                slug: 'faileduser-notification',
                subject: 'Bulk User Creation partially successful',
                body: {
                  total: allCount,
                  subject: 'Bulk User Creation partially successful',
                  failed: failedUsers.length,
                  failedUsers: failedUsers,
                },
                email: superUser.email,
              });
            } else {
              this.emailService.sendEmail({
                template: 'bulkuser.notification',
                slug: 'bulkuser-notification',
                subject: 'Bulk user import successfully completed',
                body: {
                  subject: 'Bulk user import successfully completed',
                },
                email: superUser.email,
              });
            }
          }

          resolve(true);
        } catch (error) {
          // If any promise in the `promises` array fails, reject the promise
          reject(error);
        }
      });

      parser.on('error', (error) => {
        reject(error); // Reject the main promise on error
      });
    });
  }

  private async processExcel(filePath: string, companyId: string) {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const data: any[] = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheetNames[0]]
    );
    const failedUsers = [];
    for (const row of data) {
      const isUserAdded = await this.addUsers({
        firstname: row?.firstname?.toString().trim(),
        lastname: row?.lastname?.toString().trim(),
        email: row?.email?.toString().trim().toLowerCase(),
        phone: row?.phone?.toString().trim(),
        dial_code: row?.dial_code?.toString().trim(),
        jobtitle: row?.jobtitle?.toString().trim(),
        jobtitleSlug: row?.jobtitleSlug?.toString().trim(),
        location: row?.location?.toString().trim(),
        companyId: companyId,
        role: row?.role,
      });
      if (isUserAdded && isUserAdded?.status === false) {
        if (isUserAdded?.user) failedUsers.push(isUserAdded?.user);
      }
    }
    // Send Email
    const superUser = await this.db.get(Users, {
      where: {
        role: 'SUPERADMIN',
      },
    });
    if (superUser) {
      if (failedUsers?.length) {
        this.emailService.sendEmail({
          template: 'faileduser.notification',
          slug  : 'faileduser-notification', 
          subject: 'Bulk User Creation partially successful',
          body: {
            total: data.length,
            subject: 'Bulk User Creation partially successful',
            failed: failedUsers.length,
            failedUsers: failedUsers,
          },
          email: superUser.email,
        });
      } else {
        this.emailService.sendEmail({
          template: 'bulkuser.notification',
          slug: 'bulkuser-notification',
          subject: 'Bulk user import successfully completed',
          body: {
            subject: 'Bulk user import successfully completed',
          },
          email: superUser.email,
        });
      }
    }
  }

  private async getCsvHeaders(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const parser = fs.createReadStream(filePath).pipe(
        parse({
          skip_empty_lines: true,
          trim: true,
        })
      );

      const headers = [];

      parser.on('data', (row: string[]) => {
        // if (headers.length === 0) {
        // }
        if (headers?.length < 5) {
          headers.push(row); // Set the first row as headers
        } else {
          parser.destroy(); // Stop further processing
          resolve(headers);
        }
      });

      parser.on('error', (error) => {
        console.error('Error while reading CSV:', error);
        reject(error);
      });

      parser.on('end', () => {
        if (!headers.length) {
          reject(new Error('No headers found in CSV file.'));
        }
        if (headers?.length === 1) {
          reject(new Error('No data found in CSV.'));
        }
      });
    });
  }

  private async getExcelFileHeader(filePath: string): Promise<any> {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
    if (!data.length) {
      throw new Error('No data found in CSV.');
    }
    const header = Object.keys(data[0]).map((key) => key.trim().toLowerCase());
    return [header];
  }

  validateHeaders(headers: string[]): boolean {
    const missingColumns = this.requiredColumns.filter(
      (column) => !headers.includes(column)
    );
    if (missingColumns.length > 0) {
      return false;
      // throw new BadRequestException(
      //   `Missing required columns: ${missingColumns.join(', ')}`,
      // );
    }
    return true;
  }

  async readFileHeader(filePath: string) {
    const extension = filePath.split('.').pop()?.toLowerCase();
    let headers = [];
    if (extension === 'csv') {
      headers = await this.getCsvHeaders(filePath);
    } else {
      headers = await this.getExcelFileHeader(filePath);
    }
    return headers;
  }

  private async addUsers(user: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    dial_code: string;
    jobtitle: string;
    jobtitleSlug: string;
    location: string;
    companyId: string;
    role: ROLES;
  }) {
    try {
      user.email = user.email.toLowerCase();
      const userCheck = await this.db.get(Users, {
        where: { email: user.email, isDeleted: false },
      });
      if (!userCheck) {
        // const randomNumbers = generateOTP();
        const password = generateRandomPassword();
        const hashedPassword =
          await this.passwordService.hashPassword(password);

        const countries = JSON.parse(
          fs.readFileSync('src/countries.json', 'utf8')
        );

        if (
          user.firstname &&
          user.lastname &&
          user.email &&
          user.phone &&
          user.jobtitle &&
          user.location
        ) {
          if (!validateEmail(user.email)) return { status: false, user };
          if (!validateMobileNumber(user.phone)) return { status: false, user };

          let phoneCode = '';
          let countryCode = '';

          const dialCode = user.dial_code || '61';

          const country = countries.find(
            (country) =>
              country.dial_code === dialCode ||
              country.dial_code === `+${dialCode}`
          );

          if (country) {
            phoneCode = country.dial_code;
            countryCode = country.code;
          } else {
            return { status: false, user };
          }

          const role = roles.find((role) => role.name === user.jobtitle);
          if (role) {
            user.jobtitleSlug = role.slug;
          } else {
            user.jobtitleSlug = 'other-job-title';
          }

          const createPayload = {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            password: hashedPassword,
            phone: user.phone,
            phoneCode: phoneCode,
            countryCode: countryCode,
            role: user.role as USER_ROLES,
            isUserEmailVerify: true,
          };

          await this.db.create(Users, createPayload);
          this.emailService.sendEmail({
            template: 'user.mobilewelcome',
            slug: 'user-mobile-welcome',
            email: user.email,
            subject: 'Welcome Base User',
            body: {
              name: `${user.firstname} ${user.lastname || ''}`,
              email: user.email,
              currentPassword: password,
            },
          });
          // console.log(
          //   `User ${user.firstname} ${user.lastname} with email ${user.email} added.`
          // );
        } else {
          return { status: false, user };
        }
      }
      return false;
    } catch (error) {
      //console.error(`Error adding user: ${JSON.stringify(user)}`, error);
      return { status: false, user, error };
    }
  }
}
