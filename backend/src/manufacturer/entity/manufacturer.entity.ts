import { BrandEntity } from "src/brand_master/entity/brand.entity";
import { CompanyEntity } from "src/company/entity/company.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum Status{
    ACTIVE="Active",
    INACTIVE="Inactive"
}

@Entity('manufacturer')
export class ManufacturerEntity{

@PrimaryGeneratedColumn()
manufacturerId! :number;

@Column()
manufacturerName! :string;

@Column()
manufacturerCode! :string;

@Column()
companyId!: number;
@ManyToOne(() => CompanyEntity, (company) => company.manufacturers, {
    onDelete: 'CASCADE',
  })
@JoinColumn({ name: 'companyId' })
company!: CompanyEntity;

@OneToMany(()=>BrandEntity,(brand)=>brand.manufacturer)
brands? :BrandEntity[];

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