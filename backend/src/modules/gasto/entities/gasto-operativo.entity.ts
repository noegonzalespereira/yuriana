import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Unidad } from "../../unidad/entities/unidad.entity";
import { Gasto } from "../entities/gasto.entity";
export enum TipoGastoOperativo {
  MANTENIMIENTO = 'mantenimiento',
  COMBUSTIBLE = 'combustible',
  REPUESTOS = 'repuestos',
}
@Entity('gasto_operativo')
export class GastoOperativo {
  @PrimaryGeneratedColumn()
  id_gasto_operativo!: number;

  @ManyToOne(() => Unidad, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_unidad' })
  unidad!: Unidad;

  @Column()
  id_unidad!: number;

  @ManyToOne(() => Gasto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_gasto' })
  gasto!: Gasto;

  @Column()
  id_gasto!: number;

  @Column({ type: 'enum', enum: TipoGastoOperativo })
  tipo_gasto!: TipoGastoOperativo;

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