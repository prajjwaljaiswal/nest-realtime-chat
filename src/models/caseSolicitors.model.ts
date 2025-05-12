import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { CASE_INVITATION_STATUS, SOLICITOR_ROLE } from '@common/global-interfaces';
import { BaseModel } from './BaseModel';
import { Cases } from './cases.model';
import { Users } from './user.model';

@Table({
  timestamps: true,
  paranoid: false, // Enables soft delete
})
export class CaseSolicitors extends BaseModel<CaseSolicitors> {
  @ForeignKey(() => Cases) 
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  caseId: string;

  @BelongsTo(() => Cases, { as: 'Case' })
  case: Cases;

  @ForeignKey(() => Users) 
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  solicitorId: string; 

  @BelongsTo(() => Users, { as: 'userSolicitors' }) // Define the association with Users
  solicitor: Users;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  invitedBy: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM('LEAD', 'SUPPORTER'),
    defaultValue: 'LEAD',
  })
  solicitorRole: SOLICITOR_ROLE;

  @Column({
    allowNull: false,
    type: DataType.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
    defaultValue: 'PENDING',
  })
  invitationStatus: CASE_INVITATION_STATUS;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  rejectionComments: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}
