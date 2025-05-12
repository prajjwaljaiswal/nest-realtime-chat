import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { CASE_INVITATION_STATUS } from '@common/global-interfaces';
import { BaseModel } from './BaseModel';
import { Users } from './user.model';

@Table({
  timestamps: true,
  paranoid: false, // Enables soft delete
})
export class UserContacts extends BaseModel<UserContacts> {

  @BelongsTo(() => Users, { as: 'userContacts' }) // Define the association with Users
  userContacts: Users;

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

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

}
