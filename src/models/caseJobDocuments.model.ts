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
import { BaseModel } from './BaseModel';
import { CaseJobs } from './caseJobs.model';

@Table({
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class CaseJobDocuments extends BaseModel<CaseJobDocuments> {
  @ForeignKey(() => CaseJobs) // Foreign key linking to the Cases model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  caseJobId: string;

  @BelongsTo(() => CaseJobs, {as: 'CaseJobs'})
  caseJobs: CaseJobs

  @Column({
    type: DataType.STRING,
  })
  documentName: string;

  @Column({
    type: DataType.INTEGER,
  })
  documentVersion: number;

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
