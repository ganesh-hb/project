import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ItemEntity } from './item.entity';

@Entity('item_images')
export class ItemImageEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  itemId!: number;

  @Column()
  itemImageUrl!: string;

  @Column({ default: 0 })
  isParent!: number;

  @ManyToOne(() => ItemEntity, (item) => item.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'itemId' })
  item!: ItemEntity;

  @Column({ nullable: true })
  addedBy?: number;

  @Column({ nullable: true })
  addedDate?: Date;

  @Column({ nullable: true })
  updatedBy?: number;

  @Column({ nullable: true })
  updatedDate?: Date;
}
