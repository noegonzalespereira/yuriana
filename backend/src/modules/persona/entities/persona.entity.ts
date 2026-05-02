import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('persona')
@Index(['ci'], {unique: true , where: '"status" = true'})

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
