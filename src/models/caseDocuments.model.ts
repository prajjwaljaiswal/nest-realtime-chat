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
import { CASE_DOCUMENT_TYPE } from '@common/global-interfaces';
import { BaseModel } from './BaseModel';
import { Cases } from './cases.model';
import { Users } from './user.model';

@Table({
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class CaseDocuments extends BaseModel<CaseDocuments> {
  @ForeignKey(() => Cases) // Foreign key linking to the Cases model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  caseId: string;

  
  @BelongsTo(() => Cases, {as: 'Cases'})
  cases: Cases

  @ForeignKey(() => Users) // Foreign key linking to the User model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  submittedBy: string; // the user who submitted the documents

  @Column({
    type: DataType.STRING,
  })
  documentName: string;

  // @Column({
  //   type: DataType.ENUM('CASE_DOCUMENT', 'LOI', 'EXPERT_REPORT', 'OTHER'),
  //   defaultValue: 'CASE_DOCUMENT',
  // })
  // documentType: CASE_DOCUMENT_TYPE;

  @Column({
    type: DataType.ENUM(...Object.values(CASE_DOCUMENT_TYPE)),
    defaultValue: CASE_DOCUMENT_TYPE.CASE_DOCUMENT,
  })
  documentType: CASE_DOCUMENT_TYPE;

  @Column({
    defaultValue: false,
  })
  status: boolean; // true for active and false for inactive

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
