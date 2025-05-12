import { Column, DataType, Default, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { ROLES } from '@common/global-interfaces';

@Table
export class Permission extends BaseModel<Permission> {
  @Column
  name: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  read: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  create: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  edit: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  delete: boolean;

  @Column({
    type: DataType.ENUM('SUPERADMIN', 'SOLICITOR', 'EXPERT', 'ADMIN'),
    defaultValue: 'SUPERADMIN',
  })
  role: ROLES;
}
