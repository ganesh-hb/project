import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CurrencyEntity } from 'src/currency/entity/currency.entity';
import { CustomerEntity } from './customer.entity';

@Entity('customer_currency')
export class CustomerCurrencyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customerId!: number;

  @Column({ type: 'int', unsigned: true })
  curId!: number;

  @ManyToOne(() => CustomerEntity, (customer) => customer.customerCurrencies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer!: CustomerEntity;

  @ManyToOne(() => CurrencyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curId' })
  currency!: CurrencyEntity;
}
