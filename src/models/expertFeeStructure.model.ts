import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Users } from './user.model';
import { CaseType } from './caseType.model';

@Table({
  timestamps: true,
  paranoid: false, // Enables soft delete
})
export class ExpertFeeStructure extends BaseModel<ExpertFeeStructure> {
  @ForeignKey(() => Users) // Foreign key linking to the Users model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ForeignKey(() => CaseType) // Foreign key linking to the CaseType model
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  caseTypeId: string;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  hourlyRate: number;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  oneIndividualHours: number;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  twoIndividualHours: number;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  threeIndividualHours: number;

  @AllowNull(true)
  @Column({
    type: DataType.STRING
  })
  comment: string;
  
  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @BelongsTo(() => Users) // Define the association
  user: Users;

  @BelongsTo(() => CaseType) // Define the association
  caseType: CaseType;
}