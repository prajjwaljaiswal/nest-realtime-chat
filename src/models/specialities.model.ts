import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  DataType,
  DeletedAt,
  Default,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { ExpertSpecialities } from './expertSpecialities.model'; // Import the junction table model
import { Users } from './user.model';
import { CaseSpecialities } from './caseSpecialities.model';

@Table({
  timestamps: true,
  paranoid: true, //soft delete
})
export class Specialities extends BaseModel<Specialities> {
  @AllowNull(false)
  @Column({
    type: DataType.STRING(150),
    unique: true,
  })
  title: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(150),
    unique: true,
  })
  slug: string;

  @AllowNull(false)
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  status: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isDeleted: boolean;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @DeletedAt
  @Column
  deletedAt?: Date;

  @BelongsToMany(() => Users, () => ExpertSpecialities) // Unique alias here
  users: Users[];

  @HasMany(() => CaseSpecialities, { as: 'CaseSpecialities' })
  caseSpecialities: CaseSpecialities[];

  @HasMany(() => ExpertSpecialities, { as: 'ExpertSpecialities' })
  expertSpecialities: ExpertSpecialities[];
}
