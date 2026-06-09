import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum TipoCategoria{
  CONDUCTOR = 'CONDUCTOR',
  TRACTO = 'TRACTO',
  SEMIREMOLQUE = 'SEMIREMOLQUE',
  REMOLQUE = 'REMOLQUE',
  VIAJE_INTERNACIONAL = 'VIAJE_INTERNACIONAL',
  VIAJE_NACIONAL = 'VIAJE_NACIONAL',
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
