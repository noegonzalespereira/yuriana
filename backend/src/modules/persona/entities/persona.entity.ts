import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('persona')
export class Persona {
    @PrimaryGeneratedColumn()
    id_persona!: number;

    @Column()
    ci!: number;
    
    @Column()
    nombre!: string;

    @Column()
    correo!: string;

    @Column()
    telefono!: number;

    @Column()
    telefono2!: number;

    @Column()
    ciudad?: string

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
