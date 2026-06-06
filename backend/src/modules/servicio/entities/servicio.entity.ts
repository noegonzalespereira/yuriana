import { Column,Index, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne} from "typeorm";
import { Asignacion } from "../../asignacion/entities/asignacion.entity";
import { Colaborador } from "../../colaborador/entities/colaborador.entity";
import { CategoriaEntidad } from "../../categoria-entidad/entities/categoria-entidad.entity";
import { Cliente } from "../../cliente/entities/cliente.entity";
import { Documento } from "../../documento/entities/documento.entity";
import { Factura } from "../../facturacion/entities/facturacion.entity";

export enum EstadoPago {
    PAGADO = 'pagado',
    PENDIENTE = 'pendiente',
    RETRASADO = 'retrasado',
}
export enum EstadoServicio{
    EN_CURSO = 'en curso',
    FINALIZADO = 'finalizado',

}
export enum Operador{
    YURIANA =  'yuriana',
    OTROS = 'otros',
}

export enum Moneda{
    DOLAR = 'dolar',
    BOLIVIANOS = 'bolivianos',
}
@Entity('servicio')
@Index(['codigo_servicio'], {unique: true , where: '"status" = true'})

export class Servicio {
    @PrimaryGeneratedColumn()
    id_servicio!: number;

    @Column({ unique: true })
    codigo_servicio!: string;

    @ManyToOne(() => CategoriaEntidad, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_categoria' })
    categoria!: CategoriaEntidad;
    
    @Column()
    id_categoria!: number;

    @Column({ type: 'enum', enum: Operador, default: Operador.YURIANA })
    operador!: Operador;

    @Column()
    origen!: string;

    @Column()
    destino!: string;

    @Column({ nullable: true })
    crt?: string;

    @ManyToOne(() => Cliente, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_cliente' })
    cliente!: Cliente;
    
    @Column()
    id_cliente!: number;

    @ManyToOne(() => Asignacion, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_asignacion' })
    asignacion!: Asignacion;
    
    @Column()
    id_asignacion!: number;

    @ManyToOne(() => Colaborador, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_colaborador' })
    colaborador!: Colaborador;
    
    @Column()
    id_colaborador!: number;

    @Column({ type: 'enum', enum: Moneda, default: Moneda.BOLIVIANOS})
    moneda!: Moneda;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true})
    tipo_cambio?: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    flete!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    flete_adicional?: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    total_flete!: number;

    // Control de tiempos y periodos
    @Column({ type: 'date' })
    fecha_inicio!: Date;

    @Column({ type: 'date', nullable: true })
    fecha_fin!: Date;

    @Column()
    mes!: string; 

    @Column()
    anio!: number;
    
    @Column({nullable: true})
    periodo_liquidacion?: number;

    @Column({ type: 'date', nullable: true })
    fecha_limite_pago!: Date;

    @Column({ type: 'text', nullable: true })
    descripcion_carga?: string;

    @Column({ nullable: true })
    comprobante_pago?: string; // URL del voucher en Cloudinary

    @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDIENTE })
    estado_pago!: EstadoPago;

    @Column({ type: 'enum', enum: EstadoServicio, default: EstadoServicio.EN_CURSO })
    estado_servicio!: EstadoServicio;

    @Column({type: 'date'})
    fecha_registro!: Date;

    @OneToMany(() => Documento, (documento) => documento.servicio)
    documentos!: Documento[];

    @OneToOne(() => Factura, (factura) => factura.servicio)
    factura?: Factura;

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
