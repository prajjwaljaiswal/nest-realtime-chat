import {
  Column,
  DataType,
  Table,
  Default,
  HasMany,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Document } from './document.model';

@Table({
  timestamps: true,
})
export class DocumentCategory extends BaseModel<DocumentCategory> {
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  name: string;
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  slug: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  status: boolean;
  @HasMany(() => Document)
  documents: Document[];
}
