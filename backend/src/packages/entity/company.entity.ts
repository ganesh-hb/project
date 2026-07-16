import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserCompanyGroupEntity } from './user.company.group.entity';

@Entity('company')
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  companyId!: number;

  @Column()
  companyName!: string;

  @Column({ unique: true })
  companyCode!: string;

  // @Column()
  // companyLocation!: string;

  @Column({ type: 'varchar', nullable: true })
  companyFile!: string | null;

  @Column({ unique: true })
  email!: string;

  @Column()
  website!: string;

  @Column()
  dialCode!: number;

  @Column()
  phone!: string;

  @Column()
  country!: string;

  @Column()
  state!: string;

  @Column()
  status!: string;

  @Column()
  AddressLineOne!: string;

  @Column()
  ownerName!: string;

  @Column()
  ownerEmail!: string;

  @Column()
  ownerPhone!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedDate!: Date;

  @Column({ nullable: true })
  addedBy!: number;

  @Column({ nullable: true })
  updatedBy!: number;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  postalCode!: number;

  @OneToMany(() => UserCompanyGroupEntity, (ucg) => ucg.company)
  userCompanyGroups!: UserCompanyGroupEntity[];
}
