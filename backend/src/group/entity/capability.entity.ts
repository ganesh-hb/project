import { GroupEntity } from 'src/group/entity/group.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  permissionId!: number;

  @Column({ unique: true })
  permissionName!: string;

  @Column()
  module!: string;

  @Column()
  label!: string;
}

@Entity('group_permissions')
@Unique('UQ_group_permissions_groupId_permissionId', ['groupId', 'permissionId'])
export class GroupPermissionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  groupId!: number;

  @Column()
  permissionId!: number;

  @ManyToOne(() => GroupEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group!: GroupEntity;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permissionId' })
  permission!: PermissionEntity;
}
