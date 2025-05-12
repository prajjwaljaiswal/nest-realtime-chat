import { Injectable } from '@nestjs/common';
import {
  AggregateOptions,
  Attributes,
  BulkCreateOptions,
  CountOptions,
  CreateOptions,
  CreationAttributes,
  DestroyOptions,
  FindAndCountOptions,
  FindOptions,
  FindOrCreateOptions,
  Identifier,
  UpdateOptions,
  UpsertOptions,
} from 'sequelize';
import { Sequelize, Model } from 'sequelize-typescript';
import { Col, Fn, Literal, MakeNullishOptional } from 'sequelize/types/utils';

@Injectable()
export class SeqeulizeService {
  constructor(private sequelize: Sequelize) {}
  async getByPk<T extends Model<T>>(
    model: new () => T,
    identifier?: Identifier,
    options?: Omit<FindOptions<Attributes<T>>, 'where'>
  ): Promise<T> {
    try {
      return this.sequelize.getRepository(model).findByPk(identifier, options);
    } catch (error) {
      console.log(`[TableSchemaError-GETPK] - `, error);
      throw error;
    }
  }

  async get<T extends Model<T>>(
    model: new () => T,
    option: FindOptions<Attributes<T>>
  ): Promise<T | null> {
    try {
      return this.sequelize.getRepository(model).findOne(option);
    } catch (error) {
      console.log(`[TableSchemaError-GET] - `, error);
      throw error;
    }
  }

  async getAll<T extends Model<T>>(
    model: new () => T,
    option: FindOptions<Attributes<T>> = {}
  ): Promise<Array<T>> {
    try {
      return this.sequelize.getRepository(model).findAll(option);
    } catch (error) {
      console.log(`[TableSchemaError-GET_ALL] - `, error);
      throw error;
    }
  }

  async getFilteredData<T extends Model<T>>(
    model: new () => T,
    fields: Array<keyof T>, // Specify which fields you want
    option: FindOptions<Attributes<T>> = {}
  ): Promise<Array<Partial<T>>> {
    // Cast fields to string to satisfy the type requirement for attributes
    const options: FindOptions<Attributes<T>> = {
      ...option,
      attributes: fields as string[],
    };

    return await this.getAll(model, options);
  }

  async count<T extends Model<T>>(
    model: new () => T,
    option: Omit<CountOptions<Attributes<T>>, 'group'> = {}
  ): Promise<number> {
    try {
      return this.sequelize.getRepository(model).count(option);
    } catch (error) {
      console.log(`[TableSchemaError-COUNT] - `, error);
      throw error;
    }
  }
  async findOrCreate<T extends Model<T>>(
    model: new () => T,
    options: FindOrCreateOptions
  ): Promise<[T, boolean]> {
    return this.sequelize.getRepository(model).findOrCreate(options);
  }
  async findAndCount<T extends Model<T>>(
    model: new () => T,
    option: Omit<FindAndCountOptions<Attributes<T>>, 'group'> = {}
  ): Promise<{
    rows: T[];
    count: number;
  }> {
    try {
      return this.sequelize.getRepository(model).findAndCountAll(option);
    } catch (error) {
      console.log(`[TableSchemaError-FIND_AND_COUNT] - `, error);
      throw error;
    }
  }

  async create<T extends Model<T>>(
    model: new () => T,
    values: MakeNullishOptional<T['_creationAttributes']>,
    option: CreateOptions<Attributes<T>> = {}
  ): Promise<T> {
    try {
      return this.sequelize.getRepository(model).create(values, option);
    } catch (error) {
      console.log(`[TableSchemaError-CREATE] - `, error);
      throw error;
    }
  }

  async bulkCreate<T extends Model<T>>(
    model: new () => T,
    values: ReadonlyArray<CreationAttributes<T>>,
    option: BulkCreateOptions<Attributes<T>> = {}
  ): Promise<Array<T>> {
    try {
      return this.sequelize.getRepository(model).bulkCreate(values, option);
    } catch (error) {
      console.log(`[TableSchemaError-BULK_CREATE] - `, error);
      throw error;
    }
  }

  async update<T extends Model<T>>(
    model: new () => T,
    value: {
      [key in keyof Attributes<T>]?: Col | Fn | Literal | Attributes<T>[key];
    },
    option: UpdateOptions<Attributes<T>>
  ): Promise<[affectedCount: number]> {
    try {
      return this.sequelize.getRepository(model).update(value, option);
    } catch (error) {
      console.log(`[TableSchemaError-UPDATE] - `, error);
      throw error;
    }
  }

  async sum<T extends Model<T>>(
    model: new () => T,
    field: keyof Attributes<T>,
    option: AggregateOptions<unknown, Attributes<T>> = {}
  ): Promise<number> {
    try {
      return this.sequelize.getRepository(model).sum(field, option);
    } catch (error) {
      console.log(`[TableSchemaError-SUM] - `, error);
      throw error;
    }
  }

  async delete<T extends Model<T>>(
    model: new () => T,
    option: DestroyOptions<Attributes<T>> = {}
  ): Promise<number> {
    try {
      return this.sequelize.getRepository(model).destroy(option);
    } catch (error) {
      console.log(`[TableSchemaError-DELETE] - `, error);
      throw error;
    }
  }
  async upsert<T extends Model<T>>(
    model: new () => T,
    values: CreationAttributes<T>,
    options: UpsertOptions<any> = {}
  ): Promise<[T, boolean]> {
    try {
      return this.sequelize.getRepository(model).upsert(values, options);
    } catch (error) {
      console.log(`[TableSchemaError-UPSERT] - `, error);
      throw error;
    }
  }
}
