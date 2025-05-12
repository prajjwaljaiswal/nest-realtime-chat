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
  HasMany,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Cases } from './cases.model';
import { Users } from './user.model';
import { UUID } from 'sequelize';
import { MessageDocuments } from './messageDocuments.model';

@Table({
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class Messages extends BaseModel<Messages> {
  
  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
  })
  message: string;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isRead: Boolean;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('TEXT', 'FILE', 'BOTH'),
    defaultValue: 'TEXT',
  })
  messageType: string;

  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
  })
  senderId: string;

  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
  })
  receiverId: string;

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

  @HasMany(() => MessageDocuments, { as: 'messageDocuments', foreignKey: 'messageId' })
  messageDocuments: MessageDocuments[];
}
