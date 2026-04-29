import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum TipoCategoria{
  CONDUCTOR = 'Conductor',
  TRACTO = 'Tracto',
  SEMIREMOLQUE = 'Semiremolque',
  REMOLQUE = 'Remolque',
  VIAJE_INTERNACIONAL = 'Viaje_internacional',
  VIAJE_NACIONAL = 'Viaje_nacional',
}
@Entity('categoria_entidad')
export class CategoriaEntidad {
    @PrimaryGeneratedColumn()
    id_categoria!: number;

    @Column({
        type: 'enum',
        enum: TipoCategoria,
        unique: true
    })
    tipo_categoria!: TipoCategoria;
    

}
