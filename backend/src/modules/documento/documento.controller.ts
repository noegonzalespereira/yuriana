import { 
  Controller, Get, Post, Body, Patch, Param, 
  Delete, Request, UseGuards, ParseIntPipe, 
  Query, UseInterceptors, UploadedFile,
  Res, Logger, HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { DocumentoService } from './documento.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documento')
export class DocumentoController {

  private readonly logger = new Logger(DocumentoController.name);

  constructor(
    private readonly documentoService: DocumentoService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createDocumentoDto: CreateDocumentoDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    return this.documentoService.create(createDocumentoDto, file, req.user.id);
  }

  @Get()
  findAll(
    @Query('id_conductor', new ParseIntPipe({ optional: true })) id_conductor?: number,
    @Query('id_unidad',    new ParseIntPipe({ optional: true })) id_unidad?: number,
    @Query('id_servicio',  new ParseIntPipe({ optional: true })) id_servicio?: number,
  ) {
    return this.documentoService.findAll({ id_conductor, id_unidad, id_servicio });
  }

  @Get('alertas/vencidos')
  obtenerVencidos() {
    return this.documentoService.obtenerVencidos();
  }

  @Get('alertas/por-vencer')
  obtenerPorVencer() {
    return this.documentoService.obtenerPorVencer();
  }

  
  @Get('ver/:id')
  async verDocumento(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    this.logger.log(`Solicitud URL para documento ID: ${id}`);

    const documento = await this.documentoService.findOne(id);

    if (!documento?.url_documento) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Documento no encontrado' });
    }

    try {
      const urlAcceso = this.cloudinaryService.generarUrlAcceso(documento.url_documento);
      this.logger.log(`URL generada exitosamente para documento ${id}`);
      
      // Retorna JSON con la URL — el frontend la abre directamente
      return res.json({ url: urlAcceso });

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generando URL para documento ${id}: ${mensaje}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: mensaje });
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentoService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    return this.documentoService.update(id, updateDocumentoDto, file, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    return this.documentoService.remove(id, req.user.id);
  }
}