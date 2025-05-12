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
export class QuestionAnswer extends BaseModel<QuestionAnswer> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  question: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  answer: string;

  @ForeignKey(() => DocumentCategory)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  categoryId: string;

  @BelongsTo(() => DocumentCategory)
  category: DocumentCategory;
}
