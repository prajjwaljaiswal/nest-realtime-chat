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
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { CASE_STATUS } from '@common/global-interfaces';
import { CaseType } from './caseType.model';
import { FundingType } from './fundingType';
import { Users } from './user.model';
import { CaseSubjects } from './caseSubjects.model';
import { CaseDates } from './caseDates.models';
import { CaseDocuments } from './caseDocuments.model';
import { CaseSolicitors } from './caseSolicitors.model';
import { CaseExperts } from './caseExperts.model';
import { CaseSpecialities } from './caseSpecialities.model';
import { CaseJobs } from './caseJobs.model';
import { CaseAdditionalWork } from './caseAdditionalWork.model';

@Table({
  timestamps: true,
  paranoid: true,
})
export class Cases extends BaseModel<Cases> {
  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  caseNumber: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  createdBy: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  caseTitle: string;

  @ForeignKey(() => CaseType)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  caseTypeId: string;
  @BelongsTo(() => CaseType, { as: 'CaseType' })
  caseType: CaseType;

  @ForeignKey(() => FundingType)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  fundingTypeId: string;

  @BelongsTo(() => FundingType, { as: 'FundingType' })
  fundingType: FundingType

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isFundingApproved: boolean;

  @Default(1)
  @Column({
    type: DataType.INTEGER,
  })
  numberOfIndividuals: number;

  @Default(1)
  @Column({
    type: DataType.INTEGER,
  })
  numberOfPages: number;

  @Column({
    type: DataType.DATE,
  })
  reportDeadline: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  })
  commissionMarkup: number;

  @Column({
    type: DataType.ENUM('Fixed', 'Percentage'),
    allowNull: false,
    defaultValue: 'Percentage',
  })
  commissionMarkupType: string;

  @Column({
    type: DataType.INTEGER,
  })
  createCaseStep: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  caseSummary: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'HOLD', 'REOPEN', 'CLOSED'),
    defaultValue: 'ACTIVE',
  })
  status: CASE_STATUS;

  // @Column({
  //   type: DataType.STRING,
  //   allowNull: true,
  // })
  // location: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @DeletedAt
  @Column
  deletedAt?: Date;

  @HasMany(() => CaseSolicitors, { as: 'CaseSolicitors' })
  caseSolicitors: CaseSolicitors[];

  @HasMany(() => CaseSubjects, { as: 'CaseSubjects' })
  caseSubjects: CaseSubjects[];

  @HasMany(() => CaseDates, { as: 'CaseDates' })
  caseDates: CaseDates[];

  @HasMany(() => CaseDocuments, { as: 'CaseDocuments' })
  caseDocuments: CaseDocuments[];

  @HasMany(() => CaseSpecialities, { as: 'CaseSpecialities' })
  caseSpecialities: CaseSpecialities[]

  @HasMany(() => CaseExperts, { as: 'expertCases' }) // Define the association with CaseExperts
  caseExperts: CaseExperts[];

  @HasMany(() => CaseJobs, { as: 'caseJobs' }) // Define the association with CaseExperts
  caseJobs: CaseJobs[];

  
  @HasMany(() => CaseAdditionalWork, { as: 'CaseAdditionalWork' })
  caseAdditionalWork: CaseAdditionalWork[];

  @BelongsTo(() => Users, { as: 'SolicitorUser', foreignKey: 'createdBy' })
  solicitorUser: Users;
}
