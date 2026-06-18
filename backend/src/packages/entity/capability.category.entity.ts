import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("category")
export class CompanyCategoryEntity {
  @PrimaryGeneratedColumn()
  cCategoryId!: number;

  @Column()
  options!: string;

  @OneToMany(
    () => CategoryCapabilitiesEntity,
    (categoryCapability) => categoryCapability.category
  )
  categoryCapabilities!: CategoryCapabilitiesEntity[];
}

@Entity("capabilities")
export class CapabilitiesEntity {
  @PrimaryGeneratedColumn()
  capabilityId!: number;

  @Column()
  capabilityName!: string;

  @OneToMany(
    () => CategoryCapabilitiesEntity,
    (categoryCapability) => categoryCapability.capability
  )
  categoryCapabilities!: CategoryCapabilitiesEntity[];
}

@Entity("category_capabilities")
export class CategoryCapabilitiesEntity {
  @PrimaryGeneratedColumn()
  categoryCapabilitiesId!: number;

  @ManyToOne(
    () => CompanyCategoryEntity,
    (category) => category.categoryCapabilities,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "cCategoryId" })
  category!: CompanyCategoryEntity;

  @Column()
  cCategoryId!: number;

  @ManyToOne(
    () => CapabilitiesEntity,
    (capability) => capability.categoryCapabilities,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "capabilityId" })
  capability!: CapabilitiesEntity;

  @Column()
  capabilityId!: number;
}