import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CategoriaEntidad } from "../../categoria-entidad/entities/categoria-entidad.entity";
import { Persona } from "../../persona/entities/persona.entity";

export enum EstadoOperativo {
        DISPONIBLE = 'DISPONIBLE',
        ASIGNADO = 'ASIGNADO',
        VIAJE = 'EN VIAJE',
    }

export enum EstadoLaboral {
        ACTIVO = 'ACTIVO',
        INACTIVO = 'INACTIVO',
    }
@Entity('conductor')
export class Conductor {
    @PrimaryGeneratedColumn()
    id_conductor!: number;

    @OneToOne(() => Persona, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_persona' })
    persona!: Persona;
    
    @Column()
    id_persona!: number;

    @ManyToOne(() => CategoriaEntidad, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_categoria' })
    categoria!: CategoriaEntidad;

    @Column()
    id_categoria!: number;

    @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
    sueldo?: number;

    @Column({type: 'enum', enum: EstadoOperativo, default: EstadoOperativo.DISPONIBLE})
    estado_operativo!: EstadoOperativo;

    @Column({type: 'enum', enum: EstadoLaboral, default: EstadoLaboral.ACTIVO})
    estado_laboral!: EstadoLaboral;

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
