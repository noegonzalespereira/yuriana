import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Gasto } from "../../gasto/entities/gasto.entity";

@Entity('gasto_administrativo')
export class GastoAdministrativo {
  @PrimaryGeneratedColumn()
  id_gasto_admin!: number;

  @ManyToOne(() => Gasto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_gasto' })
  gasto!: Gasto;

  @Column()
  id_gasto!: number;

  @Column() // Ejemplo: 'Sueldos', 'Alquiler de Oficina'
  tipo_gasto!: string;

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