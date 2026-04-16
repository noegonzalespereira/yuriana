import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rol')
export class Rol {

    @PrimaryGeneratedColumn()
    id_rol!: number;

    @Column({unique: true})
    nombre!: string;
    
    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ nullable: true })
    CreatedId!: number;

    @Column({ nullable: true })
    UpdatedId!: number;

    @Column({ default: true })
    status!: boolean

}
