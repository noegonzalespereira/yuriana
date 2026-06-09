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

  async findAll(filters: any) {
    const query = this.facturaRepo.createQueryBuilder('factura')
      .leftJoinAndSelect('factura.servicio', 'servicio')
      .where('factura.status = :status', { status: true });
    
    return await query.getMany();
  }
  async findOne(id: number): Promise<Factura> {
    const factura = await this.facturaRepo.findOne({
      where: { id_factura: id, status: true },
      relations: ['servicio']
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