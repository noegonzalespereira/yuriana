import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('empresa')
export class Empresa {
    @PrimaryGeneratedColumn()
    id_empresa!: number;

    @Column()
    nombre!: string;

    @Column({ unique: true })
    nit!: string;

    @Column()
    telefono!: string;
    
    @Column()
    direccion!: string;

    @Column()
    num_paut!: string;

    @Column()
    num_permiso_internacional!: string;

    @Column({type: 'text'})
    logo_url!: string;

    @CreateDateColumn()
    createdAt!: Date;
    
    @UpdateDateColumn()
    updatedAt!: Date;
    
    @Column({ nullable: true})
    CreatedId!: number;
    
    @Column({ nullable: true})
    UpdatedId!: number;

}
