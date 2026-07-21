import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ActivityMasterEntity } from './activity-master.entity';
import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';

@Entity('activity_log')
@Index('idx_user_createdAt', ['userId', 'createdAt'])
@Index('idx_activityMaster_createdAt', ['activityMasterId', 'createdAt'])
@Index('idx_companyId', ['companyId'])
@Index('idx_target_type_id', ['targetType', 'targetId'])
// @Index('idx_correlationId', ['correlationId'])
export class ActivityLogEntity {
  @PrimaryGeneratedColumn()
  logId!: number;

  @Column()
  activityMasterId!: number;

  @Column({ nullable: true })
  userId!: number;

  @Column({ nullable: true })
  companyId!: number;

  @Column()
  actorType!: string;

  @Column({ nullable: true })
  targetType!: string;

  @Column({ nullable: true })
  targetId!: string;

  @Column()
  executionStatus!: string;

  @Column()
  severity!: string;

  @Column('json', { nullable: true })
  parameters!: any;

  @Column('json', { nullable: true })
  metadata!: any;

  @Column({ type: 'text' })
  generatedMessage!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => ActivityMasterEntity, (master) => master.activityLogs, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'activityMasterId' })
  activityMaster!: ActivityMasterEntity;

  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @ManyToOne(() => CompanyEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'companyId' })
  company!: CompanyEntity;
}
