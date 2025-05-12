import { Column, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table
export class CityState extends BaseModel<CityState> {
  @Column
  state: string;
}
