import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('currency')
export class CurrencyEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  curId!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  code!: string | null;

  @Column({ type: 'varchar', length: 10 })
  symbol!: string;

  @Column({ type: 'double' })
  conversionRate!: number;

  @Column({ type: 'datetime', nullable: true })
  addedDate!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastSync!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  updatedDate!: Date | null;

  @Column({ type: 'int', nullable: true })
  addedBy!: number | null;

  @Column({ type: 'int', nullable: true })
  updatedBy!: number | null;

  @Column({ type: 'enum', enum: ['Active', 'Inactive'], nullable: true })
  status!: 'Active' | 'Inactive' | null;

}
