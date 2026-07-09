import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ActivityLogEntity } from './activity-log.entity';

@Entity('activity_master')
export class ActivityMasterEntity {
    @PrimaryGeneratedColumn()
    activityMasterId!: number;

    @Column({ unique: true })
    activityCode!: string;

    @Column()
    activityName!: string;

    @Column()
    module!: string;

    @Column()
    defaultSeverity!: string;

    @Column({ length: 500 })
    template!: string;

    @Column({ nullable: true, length: 500 })
    description!: string;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => ActivityLogEntity, (log) => log.activityMaster)
    activityLogs!: ActivityLogEntity[];
}
