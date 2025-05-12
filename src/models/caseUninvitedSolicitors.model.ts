import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UNINVITATION_SOLICITOR_STATUS } from '@common/global-interfaces';
import { BaseModel } from './BaseModel';
import { Cases } from './cases.model';
import { Users } from './user.model';

@Table({
  timestamps: true,
  paranoid: false, // Enables soft delete
})
export class CaseUninvitedSolicitors extends BaseModel<CaseUninvitedSolicitors> {
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
  invitedBy: string; // the lead solicitor who added the other solicitor

  @BelongsTo(() => Users, { as: 'userSolicitors' }) // Define the association with Users
  solicitor: Users;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  solicitorEmail: string; // The email of the solicitor who will be invited in the future may be.

  @Column({
    allowNull: false,
    type: DataType.ENUM('PENDING', 'INVITED'),
    defaultValue: 'PENDING',
  })
  invitationStatus: UNINVITATION_SOLICITOR_STATUS;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}