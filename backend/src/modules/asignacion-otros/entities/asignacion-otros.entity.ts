import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum EstadoAsignacionOtros {
    ACTIVA = 'ACTIVA',
    INACTIVA = 'INACTIVA',
}

@Entity('asignacion_otros')
export class AsignacionOtros {

    @PrimaryGeneratedColumn()
    id_asig_otros!: number;

    @Column()
    ci!: string;

    @Column()
    nombre!: string;

    @Column()
    placa!: string;

    @Column()
    telefono!: string;

    @Column()
    empresa!: string;

    @Column({ type: 'enum', enum: EstadoAsignacionOtros, default: EstadoAsignacionOtros.ACTIVA })
    estado!: EstadoAsignacionOtros;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: 'int', nullable: true })
    CreatedId!: number | null;

    @Column({ type: 'int', nullable: true })
    UpdatedId!: number | null;

    @Column({ default: true })
    status!: boolean;
}