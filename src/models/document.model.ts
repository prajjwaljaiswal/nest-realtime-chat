import {
  Column,
  DataType,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { DocumentCategory } from './documentCategory';
@Table({
  timestamps: true, // Enables createdAt and updatedAt
})
export class Document extends BaseModel<Document> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  documentName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  documentURL: string;

  @ForeignKey(() => DocumentCategory)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  categoryId: string;

  @BelongsTo(() => DocumentCategory)
  category: DocumentCategory;
}
