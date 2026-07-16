import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('currency')
export class CurrencyEntity {
  @PrimaryGeneratedColumn()
  curId!: number;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true, length: 3 })
  code!: string;

  @Column({ nullable: true, length: 5 })
  symbol!: string;
}
