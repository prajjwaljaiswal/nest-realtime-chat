import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  DataType,
  DeletedAt,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Users } from './user.model';
import { AdditionalWork } from './additionalWork.model';
import { Cases } from './cases.model';

@Table({
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class CaseAdditionalWork extends BaseModel<CaseAdditionalWork> {
  
  @AllowNull(false)
  @ForeignKey(() => Cases)
  @Column({
    type: DataType.UUID,
  })
  caseId: string;

  @BelongsTo(() => Cases, { as: 'Case' })
  case: Cases;


  @AllowNull(false)
  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
  })
  expertId: string;

  @AllowNull(false)
  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
  })
  solicitorId: string;

  @AllowNull(false)
  @ForeignKey(() => AdditionalWork)
  @Column({
    type: DataType.UUID,
  })
  workTypeId: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  jobTitle: string;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
  })
  deadline: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  jobDescription: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  rejectReson: string;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  expertProposedHours: number;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
    defaultValue: 0
  })
  expertProposedHourlyRate: number;

  @Column({
    type: DataType.ENUM('ACCEPTED', 'PENDING', 'REJECTED'),
    allowNull: false,
    defaultValue: 'PENDING',
  })
  status: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isDeleted: boolean;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @DeletedAt
  @Column
  deletedAt?: Date;
}
