import { CompanyEntity } from 'src/company/entity/company.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('item_category')
export class ItemCategoryEntity {
  @PrimaryGeneratedColumn()
  itemCategoryId!: number;

  @Column()
  itemCategoryCode!: string;

  @Column()
  itemCategoryName!: string;

  @Column({ nullable: true })
  type?: string;

  @Column()
  companyId!: number;

  @ManyToOne(() => CompanyEntity, (company) => company.itemCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company!: CompanyEntity;

  @Column({ nullable: true })
  addedBy?: number;

  @Column({ nullable: true })
  addedDate?: Date;

  @Column({ nullable: true })
  updatedBy?: number;

  @Column({ nullable: true })
  updatedDate?: Date;

  @Column()
  status!: string;
}
