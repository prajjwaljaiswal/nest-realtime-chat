import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  BelongsTo,
  ForeignKey,
  DataType,
  DeletedAt,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Messages } from './messages.model';

@Table({
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class MessageDocuments extends BaseModel<MessageDocuments> {
  
  @ForeignKey(() => Messages)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
  })
  messageId: string;

  @BelongsTo(() => Messages, { as: 'Messages' })
  messages: Messages;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  documentName: string;

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
  deletedAt: Date;
}
