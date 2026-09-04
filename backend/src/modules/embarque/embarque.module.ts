import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Embarque } from './entities/embarque.entity';
import { EmbarqueService } from './embarque.service';
import { EmbarqueController } from './embarque.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Embarque])],
  providers: [EmbarqueService],
  controllers: [EmbarqueController],
  exports: [TypeOrmModule, EmbarqueService],
})
export class EmbarqueModule {}