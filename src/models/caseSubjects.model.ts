import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  DeletedAt,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Cases } from './cases.model';
import { Users } from './user.model';

@Table({
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class CaseSubjects extends BaseModel<CaseSubjects> {
  @ForeignKey(() => Cases) // Foreign key linking to the Cases model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  caseId: string;

  @BelongsTo(() => Cases, { as: 'Cases' })
  cases: Cases

  @ForeignKey(() => Users) // Foreign key linking to the Cases model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  representedBy: string; // solicitor who represents the case subject

  @Column({
    type: DataType.STRING(200),
  })
  name: string;

  @Column({
    type: DataType.DATE,
  })
  dateOfBirth: Date;

  @Column({
    type: DataType.STRING(200),
  })
  address: string;

  @Column({
    type: DataType.BOOLEAN,
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
  deletedAt: Date;
}
