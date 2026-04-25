import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { Multer } from 'multer';
@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly cloudinaryService: CloudinaryService,
  ){}

  async create(createEmpresaDto: CreateEmpresaDto,file: Express.Multer.File, userId: number): Promise<Empresa> {
    let logoUrl;
    if(file){
      const { url} = await this.cloudinaryService.subirArchivo(file,'yuriana/empresa');
      logoUrl=url;
    }
    const existe_empresa = await this.empresaRepository.findOneBy({
      nit: createEmpresaDto.nit});
    if (existe_empresa) {
      throw new ConflictException("El NIT ya está registrado");
    }
    const empresa= this.empresaRepository.create({
      ...createEmpresaDto,
      logo_url: logoUrl,
      CreatedId: userId,
    });
    return this.empresaRepository.save(empresa);
  }

  async findAll() : Promise<Empresa[]> {
    return this.empresaRepository.find();
  }

  async findOne(id: number): Promise<Empresa> {
    const empresa  = await this.empresaRepository.findOne({
      where: {id_empresa: id},
    });
    if(!empresa){
      throw new NotFoundException("Empresa no encontrada");
    }
    return empresa;
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto,file: Express.Multer.File, userId: number): Promise<Empresa> {
    const empresa = await this.findOne(id);
    
    let logoUrl;
    if(file){
      if(empresa.logo_url){
        await this.cloudinaryService.eliminarArchivo(empresa.logo_url);
      }
      
      const { url} = await this.cloudinaryService.subirArchivo(file,'yuriana/empresa');
      logoUrl=url;
    }

    Object.assign(empresa,{

      ...updateEmpresaDto, UpdatedId: userId, logo_url: logoUrl
    });
    return this.empresaRepository.save(empresa);
  }

}
