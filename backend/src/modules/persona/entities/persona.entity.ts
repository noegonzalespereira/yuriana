import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('persona')
@Index(['ci'], {unique: true , where: '"status" = true AND ci IS NOT NULL'})

export class Persona {
    @PrimaryGeneratedColumn()
    id_persona!: number;

    @Column({ nullable: true })
    ci?: number;

    @Column()
    nombre!: string;

    @Column({ nullable: true })
    correo?: string;

    @Column({
        type: 'bigint',
        transformer: {
            to: (value: number) => value,
            from: (value: string) => value === null || value === undefined ? value : parseInt(value, 10),
        },
    })
    telefono!: number;

    @Column({
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => value === null || value === undefined ? value : parseInt(value, 10),
        },
    })
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
