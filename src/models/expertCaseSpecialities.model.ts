import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Users } from './user.model';
import { CaseType } from './caseType.model';

@Table({
  timestamps: true,
  paranoid: false, // Enables soft delete
})
export class ExpertCaseSpecialities extends BaseModel<ExpertCaseSpecialities> {
  @ForeignKey(() => Users) // Foreign key linking to the Users model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ForeignKey(() => CaseType) // Foreign key linking to the CaseType model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  caseTypeId: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @BelongsTo(() => Users) // Define the association
  user: Users;

  @BelongsTo(() => CaseType) // Define the association
  caseType: CaseType;
}
