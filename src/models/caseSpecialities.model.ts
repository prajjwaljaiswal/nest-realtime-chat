import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Cases } from './cases.model';
import { Specialities } from './specialities.model';

@Table({
  timestamps: true,
  paranoid: false, // Enables soft delete
})
export class CaseSpecialities extends BaseModel<CaseSpecialities> {
  @ForeignKey(() => Cases) // Foreign key linking to the Cases model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  caseId: string;

  @BelongsTo(() => Cases, { as: 'Case' })
  case: Cases;

  @ForeignKey(() => Specialities) // Foreign key linking to the Specialities model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  specialityId: string;

  @BelongsTo(() => Specialities, { as: 'Speciality' })
  speciality: Specialities;

  @Column({
    type: DataType.STRING,
  })
  loiFileName: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}
