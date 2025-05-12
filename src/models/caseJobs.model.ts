import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  AllowNull,
  ForeignKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { CASE_JOB_TYPES, JOB_STATUS } from '@common/global-interfaces';
import { BaseModel } from './BaseModel';
import { Users } from './user.model';
import { Cases } from './cases.model';
import { CaseJobDocuments } from './caseJobDocuments.model';
import { AdditionalWork } from './additionalWork.model';

@Table({
  timestamps: true,
  paranoid: true,
})
export class CaseJobs extends BaseModel<CaseJobs> {
  @ForeignKey(() => Cases) 
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  caseId: string;

  @ForeignKey(() => Users) 
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  expertId: string;

  @ForeignKey(() => Users) 
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  solicitorId: string;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
  })
  projectedHourlyRate: number;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
  })
  revisedHourlyRate: number;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN
  })
  hourlyPriceSameAsProjected: boolean

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  projectedTotalHours: number;
  
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  revisedTotalHours: number;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN
  })
  totalHoursSameAsProjected: boolean

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  jobTitle: string;

  @Column({
    type: DataType.ENUM(...Object.values(CASE_JOB_TYPES)),
    allowNull: false,
    defaultValue: CASE_JOB_TYPES.MAIN_REPORT,
  })
  jobType: string;

  @ForeignKey(() => AdditionalWork)
  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  additionalWorkId: string;

  @BelongsTo(() => AdditionalWork, { as: 'additionalWork' })
  additionalWork: AdditionalWork;

  @Column({
    type: DataType.ENUM(...Object.values(JOB_STATUS)),
    allowNull: false,
    defaultValue: JOB_STATUS.PENDING,
  })
  jobStatus: string;

  @Column({
    type: DataType.DATE,
  })
  deadline: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  jobSummary: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  solicitorComments: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  adminComments: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @DeletedAt
  @Column
  deletedAt?: Date;

  @HasMany(() => CaseJobDocuments, { as: 'CaseJobDocuments' })
  caseJobDocuments: CaseJobDocuments[]
}
