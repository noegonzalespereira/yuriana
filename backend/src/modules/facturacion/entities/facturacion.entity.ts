import { Column, OneToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, Entity} from "typeorm";
import { Servicio } from "../../servicio/entities/servicio.entity";
import { FotoFactura } from "./foto-factura.entity";

@Entity('factura')
export class Factura {
    @PrimaryGeneratedColumn()
    id_factura!: number;

    @OneToOne(() => Servicio, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_servicio' })
    servicio!: Servicio;

    @Column()
    id_servicio!: number;

    @Column({ type: 'varchar' ,nullable: true})
    factura_transporte!: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    monto_factura!: number;

    @Column({ nullable: true })
    foto_factura?: string;

    @OneToMany(() => FotoFactura, (f) => f.factura, { cascade: true, eager: false })
    fotos!: FotoFactura[];

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
