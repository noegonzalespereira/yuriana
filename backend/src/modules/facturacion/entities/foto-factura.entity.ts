import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn } from "typeorm";
import { Factura } from "./facturacion.entity";

@Entity('foto_factura')
export class FotoFactura {
    @PrimaryGeneratedColumn()
    id_foto_factura!: number;

    @ManyToOne(() => Factura, (f) => f.fotos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_factura' })
    factura!: Factura;

    @Column()
    id_factura!: number;

    @Column()
    url_foto!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ nullable: true })
    CreatedId!: number;
}
