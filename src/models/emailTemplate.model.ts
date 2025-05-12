import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table({
  timestamps: true,
  paranoid: true, // soft delete
})
export class EmailTemplate extends BaseModel<EmailTemplate> {
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  title: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  slug: string;

  @AllowNull(false)
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  status: boolean;

  @Column
  subject: string;

  @Column({
    type: DataType.TEXT,
  })
  content: string;

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
