import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CategoriaEntidad } from "../../categoria-entidad/entities/categoria-entidad.entity";

@Entity('requisito_documento')
export class RequisitoDocumento {
    @PrimaryGeneratedColumn()
    id_requisito_documento!: number;

    @ManyToOne(() => CategoriaEntidad, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_categoria' })
    categoria!: CategoriaEntidad;

    @Column()
    id_categoria!: number;

    @Column()
    nombre_documento!: string;

    @Column({ default: false })
    requiere_vencimiento!: boolean;

    @Column({ default: true })
    es_obligatorio!: boolean;

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
