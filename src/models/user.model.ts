import {
  Table,
  Column,
  DataType,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Unique,
  AllowNull,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { ROLES, APPROVE_STATUS } from '@common/global-interfaces';
import { UserDocuments } from './userDocuments.model';
import { ExpertSpecialities } from './expertSpecialities.model';
import { ExpertCaseSpecialities } from './expertCaseSpecialities.model';
import { Specialities } from './specialities.model';
import { CaseType } from './caseType.model';
import { ExpertFeeStructure } from './expertFeeStructure.model';
import { CaseSolicitors } from './caseSolicitors.model';
import { CaseExperts } from './caseExperts.model';

@Table({
  timestamps: true, // Enables createdAt and updatedAt
  paranoid: true, //soft delete
})
export class Users extends BaseModel<Users> {
  @Column
  firstname: string;

  @Column
  lastname: string;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Users) {
      return `${this.firstname} ${this.lastname}`;
    },
  })
  fullname: string;

  @Unique
  @AllowNull(false)
  @Column
  email: string;

  @Column
  password: string;

  @Column
  otpSendTime: Date;

  @Column
  otp: string;

  @Default(0)
  @Column
  noOfAttempts: number;

  @Column({
    type: DataType.ENUM('SUPERADMIN', 'ADMIN', 'SOLICITOR', 'EXPERT'),
    defaultValue: 'SUPERADMIN',
  })
  role: ROLES;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  avatar: string;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Users) {
      return `${this.avatar}`;
    },
  })
  avatarPath: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  phoneCode: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  countryCode: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  location: string; // address or location

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  city: string; // address or location

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    defaultValue: null,
  })
  postcode: string; // pincode or postcode of the location

  @Column({
    type: DataType.STRING(150),
    allowNull: true,
    defaultValue: null,
  })
  companyName: string; // required in case of SOLICITOR users

  @Column({
    type: DataType.STRING(150),
    allowNull: true,
    defaultValue: null,
  })
  jobTitle: string; // required in case of EXPERT users

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  expertise: string; // This related to the EXPERT users

  @Column({
    type: DataType.DATE,
  })
  lastLogin: string | Date;

  @Column({ type: DataType.JSON, allowNull: true, defaultValue: null })
  auth: {
    token: string | null;
    tokenTimeout: string | null;
  };

  @Column({
    type: DataType.NUMBER,
    defaultValue: 0,
  })
  totalExperience: number; // This related to the EXPERT users

  @Column({
    type: DataType.NUMBER,
    defaultValue: 0,
  })
  totalProfessionalExperience: number; // This related to the EXPERT users

  @Column({
    defaultValue: false,
  })
  isUserEmailVerify: boolean;

  @Column({
    defaultValue: false,
  })
  isProfileSetup: boolean; // true for profile setup and false for profile not setup

  @Default(1)
  @Column
  profileSetupStep: number; // this is for Expert profile setup, by default value will be 1

  @Default(1)
  @Column
  profileUploadDocumentStep: number; // this is for Expert profile setup, by default value will be 1, this is the sub step of the profile setup step-4, In the step 4 user will upload documents.

  @Column({
    type: DataType.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
  })
  approvalStatus: APPROVE_STATUS;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  rejectionComments: string;

  // @Column({
  //   type: DataType.TEXT,
  //   allowNull: true,
  //   defaultValue: null,
  // })
  // bio: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    defaultValue: null,
  })
  experienceDetails: string;

  @Column({
    defaultValue: false,
  })
  isDeleted: boolean;

  @Column({
    defaultValue: false,
  })
  status: boolean; // true for active and false for inactive

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @DeletedAt
  @Column
  deletedAt?: Date;

  @HasMany(() => UserDocuments) // Establish the One-to-Many relationship
  userDocuments: UserDocuments[];

  @HasMany(() => ExpertSpecialities, {
    foreignKey: 'userId',
    as: 'userExpertSpecialities',
  }) // Unique alias here
  expertSpecialities: ExpertSpecialities[];

  @HasMany(() => ExpertCaseSpecialities, {
    foreignKey: 'userId',
    as: 'userExpertCaseSpecialities',
  }) // Unique alias here
  expertCaseSpecialities: ExpertCaseSpecialities[];

  @HasMany(() => ExpertFeeStructure, {
    foreignKey: 'userId',
    as: 'userExpertFeeStructure',
  }) // Unique alias here
  ExpertFeeStructure: ExpertFeeStructure[];
  

  @BelongsToMany(() => Specialities, () => ExpertSpecialities) // Unique alias here
  specialities: Specialities[];

  @BelongsToMany(() => CaseType, () => ExpertCaseSpecialities) // Unique alias here
  caseType: CaseType[];

  @HasMany(() => CaseSolicitors, {
    as: 'userSolicitors',
    foreignKey: 'solicitorId',
  }) // Define the association
  solicitorCases: CaseSolicitors[];

  @HasMany(() => CaseExperts, { as: 'userExperts', foreignKey: 'expertId' }) // Define the association
  expertCases: CaseExperts[];
}
