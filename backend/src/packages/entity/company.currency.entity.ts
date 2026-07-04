import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CompanyEntity } from './company.entity';
import { CurrencyEntity } from './currency.entity';

@Entity('company_currency')
export class CompanyCurrencyEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    companyId!: number;

    @Column()
    curId!: number;

    @ManyToOne(() => CompanyEntity)
    @JoinColumn({ name: 'companyId' })
    company!: CompanyEntity;

    @ManyToOne(() => CurrencyEntity)
    @JoinColumn({ name: 'curId' })
    currency!: CurrencyEntity;
}