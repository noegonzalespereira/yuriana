import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RequisitoDocumento } from "../../requisito-documento/entities/requisito-documento.entity";
import { Servicio } from "../../servicio/entities/servicio.entity";
import { Conductor } from "../../conductor/entities/conductor.entity";
import { Unidad } from "../../unidad/entities/unidad.entity";
@Entity('documento')
export class Documento {
    @PrimaryGeneratedColumn()
    id_documento!: number;

    @ManyToOne(() => RequisitoDocumento, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_requisito' })
    requisito_documento!: RequisitoDocumento;

    @Column()
    id_requisito!: number;

    @Column()
    url_documento!: string;

    @Column({nullable: true})
    tipo_documento!: string;

    @Column({ nullable: true , type: 'date'})
    fecha_vencimiento?: Date;

    @ManyToOne(() => Conductor, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_conductor' })
    conductor?: Conductor;

    @Column({ nullable: true })
    id_conductor?: number;

    @ManyToOne(() => Unidad, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_unidad' })
    unidad?: Unidad;

    @Column({ nullable: true })
    id_unidad?: number;

    @ManyToOne(() => Servicio, (servicio) => servicio.documentos, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_servicio' })
    servicio?: Servicio;

    @Column({ nullable: true })
    id_servicio?: number;

    @CreateDateColumn()
    createdAt!: Date;
        
    @UpdateDateColumn()
    updatedAt!: Date;
        
    @Column({ nullable: true})
    CreatedId!: number;
        
    @Column({ nullable: true})
    UpdatedId!: number;
        
    @Column({ default: true })
    status!: boolean

}
