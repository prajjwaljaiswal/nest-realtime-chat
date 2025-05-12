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
import { Users } from './user.model';
import { Specialities } from './specialities.model';

@Table({
  timestamps: true,
  paranoid: false, // Enables soft delete
})
export class ExpertSpecialities extends BaseModel<ExpertSpecialities> {
  @ForeignKey(() => Users) // Foreign key linking to the Users model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ForeignKey(() => Specialities) // Foreign key linking to the Specialities model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  specialityId: string;


  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @BelongsTo(() => Users) // Define the association
  user: Users;

  @BelongsTo(() => Specialities) // Define the association
  speciality: Specialities;
}
