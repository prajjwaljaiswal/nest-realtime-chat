import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { USER_DOCUMENT_TYPES } from '@common/global-interfaces';
import { BaseModel } from './BaseModel';
import { Users } from './user.model';
import { RegisterBodies } from './registerBodies.model';

@Table({
  timestamps: true,
  paranoid: false, // Enables soft delete
})
export class UserDocuments extends BaseModel<UserDocuments> {
  @ForeignKey(() => Users) // Foreign key linking to the Users model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: true,
  })
  documentName: string;

  @Column({
    type: DataType.VIRTUAL,
    get(this: UserDocuments) {
      return `${this.documentName}`;
    },
  })
  documentFilePath: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  description: string;

  @ForeignKey(() => RegisterBodies) // Foreign key linking to the Users model
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  registerBodyId: string; // required in case of 'REGISTRATION_BODY' document type

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('CV', 'REGULATORY', 'REGISTRATION_BODY', 'REGISTRATION_NUMBER', 'TRANING', 'VAT_REGISTRATION'),
    defaultValue: 'CV',
  })
  documentType: USER_DOCUMENT_TYPES;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
  downloadLink: string;
}
