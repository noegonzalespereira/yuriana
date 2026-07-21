import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CategoriaEntidad } from "../../categoria-entidad/entities/categoria-entidad.entity";
import { FotoUnidad } from "../../foto_unidad/entities/foto-unidad.entity";
import { Documento } from "../../documento/entities/documento.entity";
export enum EstadoUnidad {
    DISPONIBLE = 'DISPONIBLE',
    ASIGNADO = 'ASIGNADO',
    EN_VIAJE = 'EN VIAJE',
    MANTENIMIENTO = 'MANTENIMIENTO',
}
@Entity('unidad')
@Index(['placa'], {unique: true, where: '"status" = true'})
@Index(['num_chasis'], {unique: true, where: '"status" = true'})

export class Unidad {
    @PrimaryGeneratedColumn()
    id_unidad!: number;

    @Column()
    placa!: string;

    @ManyToOne(() => CategoriaEntidad, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_categoria' })
    categoria!: CategoriaEntidad;
    
    @Column()
    id_categoria!: number;

    @Column()
    num_chasis!: string;

    @Column()
    marca!: string;
    
    @Column()
    color!: string;

    @Column()
    anio!: number;

    @Column()
    modelo!: string;

    @Column({type: 'enum', enum: EstadoUnidad, default: EstadoUnidad.DISPONIBLE})
    estado_unidad!: EstadoUnidad;

    @OneToMany(() => FotoUnidad, (fotoUnidad) => fotoUnidad.unidad)
    fotos!: FotoUnidad[];

    @OneToMany(() => Documento, (documento) => documento.unidad)
    documentos!: Documento[];

    @Column({ nullable: true })
    num_poliza?: string;

    

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
