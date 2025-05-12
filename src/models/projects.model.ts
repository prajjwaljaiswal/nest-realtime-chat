import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  HasMany,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Workspaces } from './workspaces.model';

@Table({
  timestamps: true,
})
export class Projects extends BaseModel<Projects> {
  @AllowNull(false)
  @Column
  title: string;

  @AllowNull(false)
  @Column
  description: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @HasMany(() => Workspaces)
  workspaces: Workspaces[];
}
