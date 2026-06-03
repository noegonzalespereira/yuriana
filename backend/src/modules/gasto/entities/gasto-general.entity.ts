import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Gasto } from "../entities/gasto.entity";
export enum TipoGastoGeneral {
  TALLER = 'taller',
  LLANTAS = 'llantas',
  OTROS = 'otros',
}
@Entity('gasto_general')
export class GastoGeneral {
  @PrimaryGeneratedColumn()
  id_gasto_general!: number;

  @ManyToOne(() => Gasto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_gasto' })
  gasto!: Gasto;

  @Column()
  id_gasto!: number;

  @Column({ type: 'enum', enum: TipoGastoGeneral })
  tipo_gasto!: TipoGastoGeneral;

  @Column({ default: 1 })
  id_empresa!: number;

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