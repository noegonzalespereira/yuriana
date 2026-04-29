import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rol } from '../../rol/entities/rol.entity';
export enum EstadoUsuario {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}
@Entity('usuario')
export class Usuario {

    @PrimaryGeneratedColumn()
    id_usuario!: number;
  
    @Column()
    nombre!: string;

    @Column({unique:true})
    correo!: string;
    
    @Column({select: false})
    password!: string;

    @Column()
    id_rol!: number;
    
    @Column({type: 'enum', enum: EstadoUsuario, default: EstadoUsuario.ACTIVO})
    estado!: EstadoUsuario;

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

    @ManyToOne(() =>Rol,  {onDelete: 'RESTRICT'})
    @JoinColumn({name: 'id_rol'})
    rol!: Rol;

}


