import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Persona } from '../../persona/entities/persona.entity'

export enum TipoColaborador {
        ATA = 'ATA',
        DESPACHANTE = 'DESPACHANTE',
    }

@Entity('colaborador')

export class Colaborador {
    

    @PrimaryGeneratedColumn()
    id_colaborador!: number;

    @OneToOne(() => Persona, {onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'id_persona' })
    persona!: Persona;
    
    @Column()
    id_persona!: number;

    @Column({ nullable: true })
    agencia?: string;

    @Column({
        type: 'enum',
        enum: TipoColaborador,
    })
    tipo_colaborador!: TipoColaborador;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    monto!: number;

    @Column({nullable: true})
    notas?: string;

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
