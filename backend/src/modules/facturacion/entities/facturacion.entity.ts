import { Column, OneToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, Entity} from "typeorm";
import { Servicio } from "../../servicio/entities/servicio.entity"

@Entity('factura')
export class Factura {
    @PrimaryGeneratedColumn()
    id_factura!: number;

    @OneToOne(() => Servicio, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_servicio' })
    servicio!: Servicio;

    @Column()
    id_servicio!: number;

    @Column()
    factura_transporte!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    monto_factura!: number;

    @Column()
    foto_factura!: string;

    @Column({ type: 'date' })
    fecha_emision!: Date;

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
