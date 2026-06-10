import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
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
import { FacturacionModule } from './modules/facturacion/facturacion.module';
import { IngresoExtraModule } from './modules/ingreso-extra/ingreso-extra.module';
import { DocumentoModule } from './modules/documento/documento.module';
import { CategoriaEntidadModule } from './modules/categoria-entidad/categoria-entidad.module';
import { RequisitoDocumentoModule } from './modules/requisito-documento/requisito-documento.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),

     TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DATABASE_HOST');
        // Si el host es 'postgres' (el contenedor de Docker) o 'localhost', no usa SSL.
        const esLocal = host === 'postgres' || host === 'localhost' || host === '127.0.0.1';

        return {
          type: 'postgres',
          host: host,      
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USER'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false,
          // --- CONFIGURACIÓN DINÁMICA DE SSL ---
          ssl: esLocal ? false : { rejectUnauthorized: false }
        };
      },
      inject: [ConfigService],
    }),
    CloudinaryModule,
    AuthModule, UsuarioModule, RolModule, PersonaModule, 
    ConductorModule, ClienteModule, ColaboradorModule, 
    UnidadModule, EmpresaModule, AsignacionModule, 
    ServicioModule, GastoModule,  
    FacturacionModule, IngresoExtraModule, DocumentoModule, 
    CategoriaEntidadModule, RequisitoDocumentoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
