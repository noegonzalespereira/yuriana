import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Empresa } from "../../empresa/entities/empresa.entity";

@Entity('cierre_mensual')
export class CierreMensual {
    @PrimaryGeneratedColumn()
    id_cierre!: number;

    @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_empresa' })
    empresa!: Empresa;

    @Column()
    id_empresa!: number;

    @Column()
    mes!: string;

    @Column()
    anio!: number;

    @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
    total_ingresos!: number;

    @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
    total_ingresos_extras!: number;

    @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
    total_gastos_servicios!: number;

    @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
    total_gastos_operativos!: number;

    @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
    total_gastos_admin!: number;

    @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
    total_gastos_generales!: number;

    @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
    utilidad_neta!: number;

    @Column({ default: 'ABIERTO' })
    estado!: string;

    @CreateDateColumn()
    CreatedAt!: Date;

    @UpdateDateColumn()
    UpdatedAt!: Date;

    @Column({ nullable: true })
    CreatedId!: number;

    @Column({ nullable: true })
    UpdatedId!: number;

    @Column({ default: true })
    status!: boolean;
}
