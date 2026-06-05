import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Empresa } from "../../empresa/entities/empresa.entity";

@Entity('gasto')
export class IngresoExtra {
    @PrimaryGeneratedColumn()
    id_ingreso_extra!: number;

    @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_empresa' })
    empresa!: Empresa;

    @Column()
    id_empresa!: number;
    
    @Column()
    fecha!: Date;

    @Column()
    descripcion!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    monto!: number;

    @Column()
    mes!: string; 

    @Column()
    anio!: number;

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
