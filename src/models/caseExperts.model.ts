import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { CASE_INVITATION_STATUS, LLA_APPROVAL_STATUS } from '@common/global-interfaces';
import { BaseModel } from './BaseModel';
import { Cases } from './cases.model';
import { Users } from './user.model';

@Table({
  timestamps: true,
  paranoid: false, // Enables soft delete
})
export class CaseExperts extends BaseModel<CaseExperts> {
  @ForeignKey(() => Cases) // Foreign key linking to the Cases model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  caseId: string;

  @ForeignKey(() => Users) // Foreign key linking to the user model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  expertId: string; //expert who is invited to the case

  @BelongsTo(() => Users, { as: 'userExperts' }) // Define the association with Users
  experts: Users;

  @ForeignKey(() => Users) // Foreign key linking to the user model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  invitedBy: string; //solictor who send the invitition

  @Column({
    allowNull: false,
    type: DataType.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
    defaultValue: 'PENDING',
  })
  invitationStatus: CASE_INVITATION_STATUS;

  @Column({
    allowNull: false,
    type: DataType.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
    defaultValue: 'PENDING',
  })
  llaStatus: LLA_APPROVAL_STATUS;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  rejectionComments: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  llaRejectionComments: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  projectedHourlyRate: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  projectedTotalHours: number;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @BelongsTo(() => Cases, { as: 'expertCases' }) // Define the association with Cases
  case: Cases;
}
