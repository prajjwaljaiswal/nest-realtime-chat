import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  DeletedAt,
  BelongsTo,
} from 'sequelize-typescript';
import { CASE_DATE_TYPE } from '@common/global-interfaces';
import { BaseModel } from './BaseModel';
import { Cases } from './cases.model';

@Table({
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class CaseDates extends BaseModel<CaseDates> {
  @ForeignKey(() => Cases) // Foreign key linking to the Cases model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  caseId: string;

  @BelongsTo(() => Cases, { as: 'Cases' })
  cases: Cases

  @Column({
    type: DataType.DATE,
  })
  caseDate: Date;

  @Column({
    type: DataType.ENUM('MEETING', 'COURT'),
    defaultValue: 'MEETING',
  })
  dateType: CASE_DATE_TYPE;

  @Column({
    defaultValue: false,
  })
  status: boolean; // true for active and false for inactive

  @Column({
    type: DataType.BOOLEAN,
  })
  isDeleted: boolean;

  @Column({
    type: DataType.STRING,
  })
  description: string;

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
