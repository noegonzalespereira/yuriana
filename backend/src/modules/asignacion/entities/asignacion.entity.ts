
import { ManyToOne, Column, Entity,CreateDateColumn, UpdateDateColumn,JoinColumn, PrimaryGeneratedColumn} from "typeorm";
import { Conductor } from "../../conductor/entities/conductor.entity";
import { Unidad } from "../../unidad/entities/unidad.entity";

export enum EstadoAsignacion {
        ACTIVA = 'activo',
        FINALIZADA = 'finalizada',
}

@Entity('asignacion_unidad')
export class Asignacion {
    
    @PrimaryGeneratedColumn()
    id_asignacion!: number;
  
    @ManyToOne(()=> Conductor, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_conductor' } )
    conductor!: Conductor;
  
    @Column()
    id_conductor!: number;


    @ManyToOne(()=> Unidad, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_tracto' } )
    tracto!: Unidad;
  
    @Column()
    id_tracto!: number;

    @ManyToOne(()=> Unidad, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_remolque' }) 
    remolque!: Unidad;

    @Column()
    id_remolque!: number;

    @Column({type: 'enum', enum: EstadoAsignacion, default: EstadoAsignacion.ACTIVA})
    estado_asignacion!: EstadoAsignacion;

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
