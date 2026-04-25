import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('persona')
export class Persona {
    @PrimaryGeneratedColumn()
    id_persona!: number;

    @Column()
    @Index({ unique: true })
    ci!: number;
    
    @Column()
    nombre!: string;

    @Column()
    correo!: string;

    @Column()
    telefono!: number;

    @Column({nullable: true})
    telefono2?: number;

    @Column({nullable: true})
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
