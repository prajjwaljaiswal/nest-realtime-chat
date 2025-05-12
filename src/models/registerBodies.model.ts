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
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table({
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class RegisterBodies extends BaseModel<RegisterBodies> {
  @AllowNull(false)
  @Unique
  @Column({
    type: DataType.STRING(150),
    unique: true,
  })
  title: string;

  @AllowNull(false)
  @Unique
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

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @DeletedAt
  @Column
  deletedAt?: Date;
}
