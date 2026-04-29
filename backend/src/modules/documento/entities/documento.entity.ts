import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RequisitoDocumento } from "../../requisito-documento/entities/requisito-documento.entity";

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

    @Column({ nullable: true })
    id_conductor?: number;

    @Column({ nullable: true })
    id_unidad?: number;

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
