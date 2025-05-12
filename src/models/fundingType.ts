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
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Cases } from './cases.model';

@Table({
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class FundingType extends BaseModel<FundingType> {
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

  // Define a one-to-many relationship where FundingType has many Cases
  @HasMany(() => Cases, { foreignKey: 'fundingTypeId', as: 'Cases' })
  cases: Cases[];
}
