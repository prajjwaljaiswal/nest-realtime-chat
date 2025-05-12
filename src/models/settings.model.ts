import { Table, Column, DataType } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table({
  timestamps: true, // Enables createdAt and updatedAt
})
export class Settings extends BaseModel<Settings> {
  // Commission Settings
  @Column({
    type: DataType.ENUM('Fixed', 'Percentage'),
    allowNull: false,
    defaultValue: 'Percentage',
  })
  commissionValueType: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  })
  commissionValue: number;
}
