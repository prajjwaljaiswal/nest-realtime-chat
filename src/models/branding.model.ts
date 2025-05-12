import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table({ tableName: 'Branding' })
export class Branding extends BaseModel<Branding> {
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  logoPath: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  bannerPath: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  fontName: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  bgColor: string;
}
