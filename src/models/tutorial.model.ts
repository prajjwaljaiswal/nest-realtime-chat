import { Table, Column, DataType, Default } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table({
  timestamps: true, // Enables createdAt and updatedAt
})
export class Tutorial extends BaseModel<Tutorial> {
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

  @Column({
    type: DataType.STRING(225),
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  tutorialMedia: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  status: boolean;
}
