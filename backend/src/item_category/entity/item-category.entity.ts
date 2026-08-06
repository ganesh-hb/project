import { CompanyEntity } from 'src/company/entity/company.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum Status{
    ACTIVE="Active",
    INACTIVE="Inactive"
}

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

  @Column({ nullable: true })
  parentCategoryId?: number | null;

  @ManyToOne(() => ItemCategoryEntity, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentCategoryId' })
  parentCategory?: ItemCategoryEntity;

  @OneToMany(() => ItemCategoryEntity, (category) => category.parentCategory)
  children?: ItemCategoryEntity[];

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

  @Column({
      type:"enum",
      enum :Status,
      default :Status.ACTIVE,
  })
  status!: string;
}
