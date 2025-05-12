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
import { UserContacts } from './userContacts.model';

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
    type: DataType.DATE,
  })
  lastLogin: string | Date;

  @Column({ type: DataType.JSON, allowNull: true, defaultValue: null })
  auth: {
    token: string | null;
    tokenTimeout: string | null;
  };

  @Column({
    defaultValue: false,
  })
  isUserEmailVerify: boolean;

  @Column({
    defaultValue: false,
  })
  isDeleted: boolean;

  @Column({
    defaultValue: false,
  })
  status: boolean;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @DeletedAt
  @Column
  deletedAt?: Date;

  @HasMany(() => UserContacts, { as: 'userContacts', foreignKey: 'userId' })
  expertCases: UserContacts[];
}
