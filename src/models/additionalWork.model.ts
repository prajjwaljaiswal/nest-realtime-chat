import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  DataType,
  DeletedAt,
  Unique,
  Default,
  HasMany,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { CaseJobs } from './caseJobs.model';

@Table({
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class AdditionalWork extends BaseModel<AdditionalWork> {
  @AllowNull(false)
  @Unique
  @Column({
    type: DataType.STRING(150),
  })
  title: string;

  @AllowNull(false)
  @Unique
  @Column({
    type: DataType.STRING(150),
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

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @DeletedAt
  @Column
  deletedAt?: Date;

  @HasMany(() => CaseJobs, { as: 'caseJobs' })
  caseJobs: CaseJobs[];
}
