import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { PersonaModule } from '../persona/persona.module';
import { Cliente } from './entities/cliente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports:[ 
    TypeOrmModule.forFeature([Cliente]),
    PersonaModule
  ],
  controllers: [ClienteController],
  providers: [ClienteService],
})
export class ClienteModule {}
