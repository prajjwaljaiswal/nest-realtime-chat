import {
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
  paranoid: true, // Enables soft delete
})
export class CMS extends BaseModel<CMS> {
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  slug: string;

  @Column
  subTitle: string;

  @Column
  metaTitle: string;

  @Column
  metaKeyword: string;

  @Column
  shortDescription: string;

  @Column
  metaDescription: string;

  @Column({
    type: DataType.TEXT,
  })
  content: string;

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
