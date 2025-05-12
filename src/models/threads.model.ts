import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  HasMany,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Messages } from './messages.model';

@Table({
  timestamps: true,
})
export class Threads extends BaseModel<Threads> {
  @AllowNull(false)
  @Column
  name: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @HasMany(() => Messages)
  messages: Messages[];
}
