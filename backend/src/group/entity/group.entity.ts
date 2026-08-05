import { GroupPermissionEntity } from 'src/group/entity/capability.entity';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity('group')
export class GroupEntity {
  @PrimaryGeneratedColumn()
  groupId!: number;

  @Column()
  groupName!: string;

  @Column({ unique: true })
  groupCode!: string;

  @Column({ nullable: true })
  addedBy!: number;

  @Column()
  status!: string;

  @Column({ nullable: true })
  updatedBy!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedDate!: Date;

  @OneToMany(() => GroupPermissionEntity, (gp) => gp.group)
  groupPermissions!: GroupPermissionEntity[];

  /** All user+company assignments that use this group/role */
  @OneToMany(() => UserCompanyGroupEntity, (ucg) => ucg.group)
  userCompanyGroups!: UserCompanyGroupEntity[];
}
