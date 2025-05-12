import {
  Column,
  DataType,
  Default,
  ForeignKey,
  HasOne,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Users } from './user.model';
import { EnquiryReply } from './enquiryReply.model';

@Table
export class Enquiry extends BaseModel<Enquiry> {
  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  email: string;

  @Column
  phoneNumber: string;

  @Column
  message: string;

  @Default(true)
  @Column
  isActive: boolean;

  @HasOne(() => EnquiryReply)
  replies: EnquiryReply;
}
