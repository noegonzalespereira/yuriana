import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { RolModule } from './modules/rol/rol.module';
import { PersonaModule } from './modules/persona/persona.module';
import { ConductorModule } from './modules/conductor/conductor.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { ColaboradorModule } from './modules/colaborador/colaborador.module';
import { UnidadModule } from './modules/unidad/unidad.module';
import { EmpresaModule } from './modules/empresa/empresa.module';
import { AsignacionModule } from './modules/asignacion/asignacion.module';
import { ServicioModule } from './modules/servicio/servicio.module';
import { GastoModule } from './modules/gasto/gasto.module';
import { GastoOperativoModule } from './modules/gasto-operativo/gasto-operativo.module';
import { GastoAdministrativoModule } from './modules/gasto-administrativo/gasto-administrativo.module';
import { GastoGeneralModule } from './modules/gasto-general/gasto-general.module';
import { GastoServicioModule } from './modules/gasto-servicio/gasto-servicio.module';
import { DetalleGastoServicioModule } from './modules/detalle-gasto-servicio/detalle-gasto-servicio.module';
import { FacturacionModule } from './modules/facturacion/facturacion.module';
import { IngresoExtraModule } from './modules/ingreso-extra/ingreso-extra.module';
import { DocumentoModule } from './modules/documento/documento.module';
import { CategoriaEntidadModule } from './modules/categoria-entidad/categoria-entidad.module';
import { RequisitoDocumentoModule } from './modules/requisito-documento/requisito-documento.module';
import { CierreMensualModule } from './modules/cierre-mensual/cierre-mensual.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

     TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'postgres', 
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // ⚠️ solo desarrollo
        logging: true,     // muestra queries SQL en consola
      }),
      inject: [ConfigService],
    }),
    AuthModule, UsuarioModule, RolModule, PersonaModule, 
    ConductorModule, ClienteModule, ColaboradorModule, 
    UnidadModule, EmpresaModule, AsignacionModule, 
    ServicioModule, GastoModule, GastoOperativoModule, 
    GastoAdministrativoModule, GastoGeneralModule, 
    GastoServicioModule, DetalleGastoServicioModule, 
    FacturacionModule, IngresoExtraModule, DocumentoModule, 
    CategoriaEntidadModule, RequisitoDocumentoModule, 
    CierreMensualModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
