import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Servicio } from "../../servicio/entities/servicio.entity";

@Entity('gastos_servicio')
export class GastosServicio {
  @PrimaryGeneratedColumn()
  id_gasto_servicio!: number;

  @ManyToOne(() => Servicio, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_servicio' })
  servicio!: Servicio;

  @Column()
  id_servicio!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  tipo_cambio!: number;

  @Column({ default: 'bolivianos' })
  moneda!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  viatico_entregado!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  viatico_bs!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_gastos!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_gastos_bs!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  saldo!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  saldo_bs!: number;

  @Column({ type: 'date' })
  fecha_registro!: Date;

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