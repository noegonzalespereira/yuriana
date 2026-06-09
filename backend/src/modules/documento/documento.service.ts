import { 
  BadRequestException, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { RequisitoDocumentoService } from '../requisito-documento/requisito-documento.service';
@Injectable()
export class DocumentoService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly requisitoService: RequisitoDocumentoService,
  ) {}

  
  private calcularEstado(fecha_vencimiento: Date | null | undefined): {
    estado: string;
    dias_restantes: number | null;
  } 
  
  {
    if (!fecha_vencimiento) {
      return { estado: 'vigente', dias_restantes: null };
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaVenc = new Date(fecha_vencimiento);
    fechaVenc.setHours(0, 0, 0, 0);

    const dias_restantes = Math.ceil(
      (fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );


    if (dias_restantes < 0)   return { estado: 'vencido',    dias_restantes };
    if (dias_restantes <= 15) return { estado: 'por_vencer', dias_restantes };
    return { estado: 'vigente', dias_restantes };
  }

  
  private obtenerCarpeta(dto: { id_conductor?: number; id_unidad?: number; id_servicio?: number; }): string {
    if (dto.id_conductor) return 'yuriana/documentos/conductor';
    if (dto.id_unidad)    return 'yuriana/documentos/unidad';
    if (dto.id_servicio)  return 'yuriana/documentos/servicio';
    return 'yuriana/documentos/otros';
  }

  
  async create(createDocumentoDto: CreateDocumentoDto,file: Express.Multer.File,userId: number): Promise<Documento> {

    const buscarExistente = await this.documentoRepository.findOne({
      where: {
        id_requisito: createDocumentoDto.id_requisito,
        id_conductor: createDocumentoDto.id_conductor ?? undefined,
        id_unidad: createDocumentoDto.id_unidad ?? undefined,
        id_servicio: createDocumentoDto.id_servicio ?? undefined,
        status: true
      }
    });
    if (buscarExistente) {
      console.log(`Documento existente detectado (ID: ${buscarExistente.id_documento}). Derivando a actualización de expediente...`);
      const dtoUpdate: UpdateDocumentoDto = {
        fecha_vencimiento: createDocumentoDto.fecha_vencimiento
      };
      return this.update(buscarExistente.id_documento, dtoUpdate, file, userId);
    }

    if (!file) {
      throw new BadRequestException('El archivo del documento es obligatorio');
    }

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!tiposPermitidos.includes(file.mimetype)) {
      throw new BadRequestException(
        'Solo se permiten archivos PDF, JPG o PNG'
      );
    }

    const propietarios = [
      createDocumentoDto.id_conductor,
      createDocumentoDto.id_unidad,
      createDocumentoDto.id_servicio,
    ].filter(Boolean); 

    if (propietarios.length !== 1) {
      throw new BadRequestException(
        'El documento debe pertenecer exactamente a un conductor, unidad o servicio'
      );
    }

    
    const requisito = await this.requisitoService.findOne(
      createDocumentoDto.id_requisito
    );

    if (requisito.requiere_vencimiento && !createDocumentoDto.fecha_vencimiento) {
      throw new BadRequestException(
        `El documento "${requisito.nombre_documento}" requiere fecha de vencimiento`
      );
    }

    const fecha_vencimiento = requisito.requiere_vencimiento
      ? new Date(createDocumentoDto.fecha_vencimiento!)
      : null;

    const carpeta = this.obtenerCarpeta(createDocumentoDto);
    const { url } = await this.cloudinaryService.subirArchivo(file, carpeta);

    const documento = this.documentoRepository.create({
      requisito_documento: requisito,  
      url_documento:     url,
      tipo_documento:    file.mimetype,   
      fecha_vencimiento: fecha_vencimiento ?? undefined,
      id_conductor:      createDocumentoDto.id_conductor,
      id_unidad:         createDocumentoDto.id_unidad,
      id_servicio:       createDocumentoDto.id_servicio,
      CreatedId:         userId,
    });

    const guardado = await this.documentoRepository.save(documento);

    return {
      ...guardado,
      ...this.calcularEstado(guardado.fecha_vencimiento),
    } as any;
  }


  async findAll(filters: {id_conductor?: number;id_unidad?: number;id_servicio?: number;}): Promise<Documento[]> {
    const query = this.documentoRepository
      .createQueryBuilder('documento')
      .leftJoinAndSelect('documento.requisito_documento', 'requisito')
      .leftJoinAndSelect('requisito.categoria', 'categoria')
      .where('documento.status = :status', { status: true });

    if (filters.id_conductor) {
      query.andWhere('documento.id_conductor = :id', { id: filters.id_conductor });
    }
    if (filters.id_unidad) {
      query.andWhere('documento.id_unidad = :id', { id: filters.id_unidad });
    }
    if (filters.id_servicio) {
      query.andWhere('documento.id_servicio = :id', { id: filters.id_servicio });
    }

    const documentos = await query.getMany();

    return documentos.map(doc => ({
      ...doc,
      ...this.calcularEstado(doc.fecha_vencimiento),
    }));
  }

  async findOne(id: number): Promise<Documento> {
    const documento = await this.documentoRepository.findOne({
      where: { id_documento: id, status: true },
      relations: ['requisito_documento', 'requisito_documento.categoria'],
    });
    if (!documento) {
      throw new BadRequestException('Documento no encontrado');
    }
    return {
      ...documento,
      ...this.calcularEstado(documento.fecha_vencimiento),
    };
  }

  async obtenerVencidos(): Promise<any[]> {
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); 
    const documentos = await this.documentoRepository
      .createQueryBuilder('documento')
      .leftJoinAndSelect('documento.requisito_documento', 'requisito')
      .leftJoinAndSelect('documento.conductor', 'conductor')
      .leftJoinAndSelect('conductor.persona', 'persona')
      .leftJoinAndSelect('documento.unidad', 'unidad')
      .leftJoinAndSelect('documento.servicio', 'servicio')
      .where('documento.status = :status', { status: true })
      .andWhere('documento.fecha_vencimiento IS NOT NULL')
      .andWhere('documento.fecha_vencimiento < :hoy', { hoy })
      .andWhere('(conductor.status = true OR conductor.id_conductor IS NULL)')
      .andWhere(
        '(unidad.status = true OR unidad.id_unidad IS NULL)'
      )
      .andWhere(
        '(servicio.status = true OR servicio.id_servicio IS NULL)'
      )
      .getMany();

    return documentos.map(doc => ({
      ...doc,
      ...this.calcularEstado(doc.fecha_vencimiento),
    }));
  }

  async obtenerPorVencer(): Promise<any[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const en15Dias = new Date();
    en15Dias.setDate(hoy.getDate() + 15);
    en15Dias.setHours(23, 59, 59, 999);

    const documentos = await this.documentoRepository
      .createQueryBuilder('documento')
      .leftJoinAndSelect('documento.requisito_documento', 'requisito')
      .leftJoinAndSelect('documento.conductor', 'conductor')
      .leftJoinAndSelect('conductor.persona', 'persona')
      .leftJoinAndSelect('documento.unidad', 'unidad')
      .leftJoinAndSelect('documento.servicio', 'servicio')
      .where('documento.status = :status', { status: true })
      .andWhere('documento.fecha_vencimiento IS NOT NULL')
      .andWhere('documento.fecha_vencimiento BETWEEN :hoy AND :en15Dias', 
        { hoy, en15Dias })
      .andWhere('(conductor.status = true OR conductor.id_conductor IS NULL)')
      .andWhere(
        '(unidad.status = true OR unidad.id_unidad IS NULL)'
      )
      .andWhere(
        '(servicio.status = true OR servicio.id_servicio IS NULL)'
      )
      .getMany();

    return documentos.map(doc => ({
      ...doc,
      ...this.calcularEstado(doc.fecha_vencimiento),
    }));
  }

  async getEstadoDocumentosPorEntidad(
    referencia_id: number,
    tipo_entidad: 'conductor' | 'unidad' | 'viaje'
  ): Promise<{ estado: string; documento_critico: string | null; dias_restantes: number | null }> {

    
    const columnaFk = 
      tipo_entidad === 'conductor' ? 'documento.id_conductor' :
      tipo_entidad === 'unidad'    ? 'documento.id_unidad'    :
                                    'documento.id_servicio';
    const documentos = await this.documentoRepository
      .createQueryBuilder('documento')
      .leftJoinAndSelect('documento.requisito_documento', 'requisito')
      .where('documento.status = :status', { status: true })
      .andWhere(`${columnaFk} = :referencia_id`, { referencia_id })
      .getMany();

    if (documentos.length === 0) {
      return { estado: 'sin_documentos', documento_critico: null, dias_restantes: null };
    }

    let estadoFinal = 'vigente';
    let documento_critico: string | null = null;
    let dias_restantes: number | null = null;

    for (const doc of documentos) {
      const resultado = this.calcularEstado(doc.fecha_vencimiento);

      if (resultado.estado === 'vencido') {
        estadoFinal = 'vencido';
        documento_critico = doc.requisito_documento?.nombre_documento ?? 'Documento desconocido';
        dias_restantes = resultado.dias_restantes;
        break;
      }

      if (resultado.estado === 'por_vencer' && estadoFinal !== 'vencido') {
        estadoFinal = 'por_vencer';
        documento_critico = doc.requisito_documento?.nombre_documento ?? 'Documento desconocido';
        dias_restantes = resultado.dias_restantes;
      }
    }

    return { estado: estadoFinal, documento_critico, dias_restantes };
  }



  async update(id: number, updateDocumentoDto: UpdateDocumentoDto, file: Express.Multer.File, userId: number): Promise<Documento> {
    const documento = await this.findOne(id);

    let url_documento = documento.url_documento;
    let tipo_documento = documento.tipo_documento;

    // PERMITIR ACTUALIZAR POR SEPARADO: Si no viene archivo, omitimos la carga en Cloudinary
    if (file) {
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!tiposPermitidos.includes(file.mimetype)) {
        throw new BadRequestException('Solo se permiten archivos PDF, JPG o PNG');
      }

      // Eliminamos el archivo anterior de forma limpia usando el destructor optimizado
      if (documento.url_documento) {
        await this.cloudinaryService.eliminarArchivo(documento.url_documento);
      }

      const carpeta = this.obtenerCarpeta(documento);
      const { url } = await this.cloudinaryService.subirArchivo(file, carpeta);
      url_documento = url;
      tipo_documento = file.mimetype;
    }

    // Sincronizamos la fecha de vencimiento solo si el DTO la incluye
    const fecha_vencimiento = updateDocumentoDto.fecha_vencimiento
      ? new Date(updateDocumentoDto.fecha_vencimiento)
      : documento.fecha_vencimiento;

    Object.assign(documento, {
      url_documento,
      tipo_documento,
      fecha_vencimiento,
      UpdatedId: userId,
    });

    const actualizado = await this.documentoRepository.save(documento);
    
    return {
      ...actualizado,
      ...this.calcularEstado(actualizado.fecha_vencimiento),
    } as any;
  }

  async remove(id: number, userId: number): Promise<Documento> {
    const documento = await this.findOne(id);
    documento.status = false;
    documento.UpdatedId = userId;
    return this.documentoRepository.save(documento);
  }
}