import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompanyEntity } from './company.entity';
import { CurrencyEntity } from './currency.entity';

@Entity('company_currency')
export class CompanyCurrencyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  companyId!: number;

  @Column({ type: 'int', unsigned: true })
  curId!: number;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company!: CompanyEntity;

  @ManyToOne(() => CurrencyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curId' })
  currency!: CurrencyEntity;
}
