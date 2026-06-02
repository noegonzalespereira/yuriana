import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Unidad } from "../../unidad/entities/unidad.entity";

@Entity('foto_unidad')
export class FotoUnidad {
  @PrimaryGeneratedColumn()
  id_foto!: number;

  @ManyToOne(() => Unidad, (unidad) => unidad.fotos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_unidad' })
  unidad!: Unidad;

  @Column()
  id_unidad!: number;

  @Column()
  url_foto!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  CreatedId!: number;

  @Column({ nullable: true })
  UpdatedId!: number;

  @Column({ default: true })
  status!: boolean;
}