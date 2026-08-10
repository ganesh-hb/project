import { CompanyEntity } from "src/company/entity/company.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum Status{
    ACTIVE="Active",
    INACTIVE="Inactive"
}

@Entity('uom')
export class UomEntity{

@PrimaryGeneratedColumn()
uomId! :number;

@Column()
uomName! :string;

@Column()
uomCode! :string;

@Column()
abbreviation!:string;

@Column()
isoCode!:string;

@Column()
companyId!: number;
@ManyToOne(() => CompanyEntity, (company) => company.uoms, {
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