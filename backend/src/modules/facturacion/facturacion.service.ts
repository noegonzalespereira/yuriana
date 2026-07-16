import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacturacionDto } from './dto/create-facturacion.dto';
import { UpdateFacturacionDto } from './dto/update-facturacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from '../facturacion/entities/facturacion.entity';
import { FotoFactura } from '../facturacion/entities/foto-factura.entity';
import { Repository, In } from 'typeorm';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class FacturacionService {
  constructor(
    @InjectRepository(Factura) private readonly facturaRepo: Repository<Factura>,
    @InjectRepository(FotoFactura) private readonly fotoFacturaRepo: Repository<FotoFactura>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateFacturacionDto, file: Express.Multer.File, userId: number) {
    const fEmision = new Date();
    const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/facturas');

    const factura = this.facturaRepo.create({
      ...dto,
      foto_factura: url,
      fecha_emision: fEmision,
      mes: (fEmision.getMonth() + 1).toString().padStart(2, '0'),
      anio: fEmision.getFullYear(),
      CreatedId: userId,
    });

    return await this.facturaRepo.save(factura);
  }

  async findAll(filters: { fecha_inicio?: string; fecha_fin?: string; id_categoria?: string }) {
    const query = this.facturaRepo.createQueryBuilder('factura')
      .leftJoinAndSelect('factura.servicio', 'servicio')
      .leftJoinAndSelect('servicio.categoria', 'categoria')
      .where('factura.status = :status', { status: true });

    if (filters.fecha_inicio) {
      query.andWhere('factura.fecha_emision >= :f1', { f1: filters.fecha_inicio });
    }
    if (filters.fecha_fin) {
      query.andWhere('factura.fecha_emision <= :f2', { f2: filters.fecha_fin });
    }
    if (filters.id_categoria) {
      query.andWhere('servicio.id_categoria = :id_cat', { id_cat: parseInt(filters.id_categoria) });
    }

    return query.orderBy('factura.fecha_emision', 'DESC').getMany();
  }

  async getTotales(filters: { fecha_inicio?: string; fecha_fin?: string; id_categoria?: string }) {
    const facturas = await this.findAll(filters);
    const total_facturado = facturas.reduce((sum, f) => sum + Number(f.monto_factura), 0);
    return {
      total_facturado: +total_facturado.toFixed(2),
      impuesto_it: +(total_facturado * 0.03).toFixed(2),
    };
  }
  async findOne(id: number): Promise<Factura> {
    const factura = await this.facturaRepo.findOne({
      where: { id_factura: id, status: true },
      relations: ['servicio', 'servicio.categoria', 'fotos']
    });

    if (!factura) {
      throw new NotFoundException(`La factura  no existe o fue eliminada`);
    }
    return factura;
  }

  async update(
    id: number,
    dto: UpdateFacturacionDto,
    files: { foto_factura?: Express.Multer.File[]; fotos_nuevas?: Express.Multer.File[] },
    userId: number,
  ): Promise<Factura> {
    const factura = await this.findOne(id);

    // 1. Eliminar foto principal si se solicitó
    if (dto.eliminar_foto_principal === 'true' && factura.foto_factura) {
      await this.cloudinaryService.eliminarArchivo(factura.foto_factura);
      factura.foto_factura = undefined;
    }

    // 2. Reemplazar foto principal si se subió una nueva
    const fotoPrincipalFile = files?.foto_factura?.[0];
    if (fotoPrincipalFile) {
      if (factura.foto_factura) {
        await this.cloudinaryService.eliminarArchivo(factura.foto_factura);
      }
      const { url } = await this.cloudinaryService.subirArchivo(fotoPrincipalFile, 'yuriana/facturas');
      factura.foto_factura = url;
    }

    // 3. Eliminar fotos adicionales seleccionadas
    if (dto.ids_fotos_eliminar) {
      const ids = dto.ids_fotos_eliminar.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (ids.length > 0) {
        const fotosAEliminar = await this.fotoFacturaRepo.findBy({ id_foto_factura: In(ids) });
        for (const foto of fotosAEliminar) {
          await this.cloudinaryService.eliminarArchivo(foto.url_foto);
          await this.fotoFacturaRepo.remove(foto);
        }
      }
    }

    // 4. Subir nuevas fotos adicionales
    if (files?.fotos_nuevas?.length) {
      for (const archivo of files.fotos_nuevas) {
        const { url } = await this.cloudinaryService.subirArchivo(archivo, 'yuriana/facturas');
        const nuevaFoto = this.fotoFacturaRepo.create({ id_factura: factura.id_factura, url_foto: url, CreatedId: userId });
        await this.fotoFacturaRepo.save(nuevaFoto);
      }
    }

    // 5. Actualizar campos del DTO (excluir los campos de control de fotos)
    // Se usa update() en lugar de save() para evitar que TypeORM cascade sobre
    // fotos y trate de nullificar las recién agregadas que no están en memoria.
    const { ids_fotos_eliminar, eliminar_foto_principal, ...camposDto } = dto;
    await this.facturaRepo.update(id, { ...camposDto, UpdatedId: userId });

    return await this.findOne(id);
  }

  async remove(id: number, userId: number): Promise<Factura> {
    const factura = await this.findOne(id);
    // if(factura.servicio.estado_servicio == "EN_CURSO") {
    //   throw new Error("No se puede eliminar la factura porque el servicio asociado aún está en curso.");
    // }
    
    // Aplicamos borrado lógico para mantener integridad histórica
    factura.status = false;
    factura.UpdatedId = userId;
    
    return await this.facturaRepo.save(factura);
  }
}