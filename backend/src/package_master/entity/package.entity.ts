import { CompanyEntity } from "src/company/entity/company.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum Status{
    ACTIVE="Active",
    INACTIVE="Inactive"
}

@Entity('package_master')
export class PackageEntity{

    @PrimaryGeneratedColumn()
    packageId! :number;
    
    @Column()
    packageName! :string;
    
    @Column()
    packageCode! :string;

    @Column({nullable:true})
    description?:string
    
    @Column()
    companyId!: number;
    @ManyToOne(() => CompanyEntity, (company) => company.packages, {
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
