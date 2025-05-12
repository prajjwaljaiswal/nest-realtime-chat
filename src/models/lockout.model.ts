import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table({
  timestamps: true,
})
export class Lockout extends BaseModel<Lockout> {
  @Column
  userIP: string;

  @Column({
    type: DataType.DATE,
  })
  lockoutTimeout: string | Date;
}
