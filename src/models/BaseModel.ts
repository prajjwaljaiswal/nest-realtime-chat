import { Model, Column, DataType } from 'sequelize-typescript';

export abstract class BaseModel<T> extends Model<T> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
}
