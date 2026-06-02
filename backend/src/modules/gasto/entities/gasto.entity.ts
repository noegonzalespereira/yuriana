import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('gasto')
export class Gasto {
  @PrimaryGeneratedColumn()
  id_gasto!: number;

  @Column({ type: 'date' })
  fecha!: Date;

  @Column()
  mes!: string;

  @Column()
  anio!: number;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto!: number;

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