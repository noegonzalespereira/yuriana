import { Injectable, ConflictException,NotFoundException } from '@nestjs/common';

import { CreateFacturacionDto } from './dto/create-facturacion.dto';
import { UpdateFacturacionDto } from './dto/update-facturacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from '../facturacion/entities/facturacion.entity';
import { Not, Repository } from 'typeorm';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class FacturacionService {
  constructor(
    @InjectRepository(Factura) private readonly facturaRepo: Repository<Factura>,
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
      relations: ['servicio', 'fotos']
    });

    if (!factura) {
      throw new NotFoundException(`La factura  no existe o fue eliminada`);
    }
    return factura;
  }

  async update(id: number, dto: UpdateFacturacionDto, file: Express.Multer.File, userId: number): Promise<Factura> {
    const factura = await this.findOne(id);

    // Si el usuario sube una nueva foto de la factura
    if (file) {
      // 1. Borramos la foto anterior de Cloudinary para no llenar espacio innecesario
      if (factura.foto_factura) {
        await this.cloudinaryService.eliminarArchivo(factura.foto_factura);
      }
      // 2. Subimos la nueva
      const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/facturas');
      factura.foto_factura = url;
    }

    // Actualizamos los campos de auditoría y los datos del DTO
    Object.assign(factura, {
      ...dto,
      UpdatedId: userId,
    });

    return await this.facturaRepo.save(factura);
  }

  async remove(id: number, userId: number): Promise<Factura> {
    const factura = await this.findOne(id);
    
    // Aplicamos borrado lógico para mantener integridad histórica
    factura.status = false;
    factura.UpdatedId = userId;
    
    return await this.facturaRepo.save(factura);
  }
}