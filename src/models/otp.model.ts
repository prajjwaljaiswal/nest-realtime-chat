import { Table, Column } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
@Table({
  timestamps: true, // Enables createdAt and updatedAt
})
export class Otp extends BaseModel<Otp> {
  @Column({
    unique: true,
  })
  email: string;

  @Column
  otpSendTime: Date;

  @Column
  otp: string;
}
