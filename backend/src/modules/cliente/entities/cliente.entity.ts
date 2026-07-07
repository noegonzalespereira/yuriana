import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,

   
} from 'typeorm';
import { Persona } from "../../persona/entities/persona.entity";
@Entity('cliente')
@Index(['codigo_cliente'], { unique: true, where: '"status" = true' })
@Index(['nit'], { unique: true, where: '"status" = true AND nit IS NOT NULL' })

export class Cliente {
    @PrimaryGeneratedColumn()
    id_cliente!: number;

    @Column({nullable: true})
    codigo_cliente!: string;

    @Column({
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => value === null || value === undefined ? value : parseInt(value, 10),
        },
    })
    nit?: number

    @Column({nullable: true})
    razon_social?: string;

    @OneToOne(() => Persona, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_persona' })
    persona!: Persona;

    @Column()
    id_persona!: number;

    @Column({nullable: true})
    direccion?: string;

    @Column({nullable: true})
    notas?: string;

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
