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

    @Column()
    companyCode!: string;

    @Column()
    companyLocation!: string;

    @Column()
    companyFile!: string;

    @Column()
    email! : string;

    @Column()
    website!: string;

    @Column()
    dialCode!:number;

    @Column()
    phone!:string;

    @Column()
    country!:string;

    @Column()
    state!:string;

    @Column()
    postalCode!:number;

    @Column()
    AddressLineOne!:string;

    @Column()
    ownerName!:string;

    @Column()
    ownerEmail!:string;

    @Column()
    ownerPhone!:string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;

    @Column({ nullable: true })
    addedBy!: number;

    @OneToMany(
        () => UserCompanyGroupEntity,
        (ucg) => ucg.company,
    )
    userCompanyGroups!: UserCompanyGroupEntity[];
}