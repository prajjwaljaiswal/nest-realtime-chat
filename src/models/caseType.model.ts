import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  DataType,
  DeletedAt,
  Default,
  BelongsToMany,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { ExpertCaseSpecialities } from './expertCaseSpecialities.model';
import { Users } from './user.model';

@Table({
  timestamps: true,
  paranoid: true, // soft delete
})
export class CaseType extends BaseModel<CaseType> {
  @AllowNull(false)
  @Column({
    type: DataType.STRING(150),
    unique: true,
  })
  title: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(150),
    unique: true,
  })
  slug: string;

  @AllowNull(false)
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  status: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isDeleted: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  showClientDetails: boolean; // true - show client details, false - hide client details

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isLaaApprovalRequired: boolean; // true - LAA approval is required, false - LAA approval is not required

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @DeletedAt
  @Column
  deletedAt?: Date;

  @BelongsToMany(() => Users, () => ExpertCaseSpecialities) // Unique alias here
  users: Users[];
}
