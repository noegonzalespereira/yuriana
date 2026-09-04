import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Servicio } from '../../servicio/entities/servicio.entity';

@Entity('embarque')
export class Embarque {
  @PrimaryGeneratedColumn()
  id_embarque!: number;

  @Column({ unique: true })
  crt!: string;

  @Column({ type: 'integer' })
  total_unidades!: number;

  @Column({ type: 'integer' })
  unidades_restantes!: number;

  @Column({ default: true })
  visible!: boolean;

  @OneToMany(() => Servicio, (servicio) => servicio.embarque)
  servicios!: Servicio[];

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