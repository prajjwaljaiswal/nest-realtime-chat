import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Projects } from './projects.model';
import { Threads } from './threads.model';

@Table({
  timestamps: true,
})
export class Workspaces extends BaseModel<Workspaces> {
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

  @Column
  @ForeignKey(() => Projects)
  projectId: string;

  @BelongsTo(() => Projects)
  project: Projects;

  @HasMany(() => Threads)
  threads: Threads[];
}
