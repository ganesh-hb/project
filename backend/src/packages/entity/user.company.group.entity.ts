import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';
import { GroupEntity } from './group.entity';

@Entity('user_company_group')
export class UserCompanyGroupEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column()
    companyId!: number;

    @Column()
    groupId!: number;

    @Column({ default: 0 })
    is_parent!: number;


    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;

    @ManyToOne(() => UserEntity, (user) => user.userCompanyGroups, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @ManyToOne(() => CompanyEntity, (company) => company.userCompanyGroups, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'companyId' })
    company!: CompanyEntity;

    @ManyToOne(() => GroupEntity, (group) => group.userCompanyGroups, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'groupId' })
    group!: GroupEntity;
}