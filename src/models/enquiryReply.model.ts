import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Enquiry } from './enquiry.model';

@Table
export class EnquiryReply extends BaseModel<EnquiryReply> {
  @ForeignKey(() => Enquiry)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  enquiryId: string;

  @Column
  subject: string;

  @Column
  email: string;

  @Column
  message: string;

  @BelongsTo(() => Enquiry)
  enquiry: Enquiry;
}
