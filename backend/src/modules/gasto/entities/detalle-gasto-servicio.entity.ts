import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GastosServicio } from "../entities/gasto-servicio.entity";
import { Gasto } from "../../gasto/entities/gasto.entity";
export enum TipoGastoServicio {
  VIATICOS = 'VIATICOS',
  PEAJES = 'PEAJES',
  ATA_ORIGEN = 'ATA_ORIGEN',
  ATA_FRONTERA = 'ATA_FRONTERA',
  OTROS = 'OTROS',
}
@Entity('detalle_gasto_servicio')
export class DetalleGastoServicio {
  @PrimaryGeneratedColumn()
  id_detalle_servicio!: number;

  @ManyToOne(() => GastosServicio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_gasto_servicio' })
  gastosServicio!: GastosServicio;

  @Column()
  id_gasto_servicio!: number;

  @ManyToOne(() => Gasto, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_gasto' })
  gasto!: Gasto;

  @Column()
  id_gasto!: number;

  @Column({ type: 'enum', enum: TipoGastoServicio })
  tipo_gasto!: TipoGastoServicio;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto_bs!: number;

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