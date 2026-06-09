import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CierreMensualService } from './cierre-mensual.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cierre-mensual')
export class CierreMensualController {
  constructor(private readonly cierreMensualService: CierreMensualService) {}

  @Get('resumen')
  getDashboardResumen() {
    return this.cierreMensualService.getDashboardResumen();
  }

  @Get('estado-resultados')
  getEstadoResultados(
    @Query('mes') mes: string,
    @Query('anio') anio: string,
  ) {
    const now = new Date();
    const mesParam = mes || (now.getMonth() + 1).toString().padStart(2, '0');
    const anioParam = anio ? parseInt(anio, 10) : now.getFullYear();
    return this.cierreMensualService.getEstadoResultados(mesParam, anioParam);
  }

  @Get('documentos-vencidos')
  getDocumentosVencidos() {
    return this.cierreMensualService.getDocumentosVencidos();
  }

  @Get('ultimos-viajes')
  getUltimosViajes() {
    return this.cierreMensualService.getUltimosViajes();
  }
}
