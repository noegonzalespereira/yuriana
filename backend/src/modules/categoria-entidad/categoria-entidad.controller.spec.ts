import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaEntidadController } from './categoria-entidad.controller';
import { CategoriaEntidadService } from './categoria-entidad.service';

describe('CategoriaEntidadController', () => {
  let controller: CategoriaEntidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriaEntidadController],
      providers: [CategoriaEntidadService],
    }).compile();

    controller = module.get<CategoriaEntidadController>(CategoriaEntidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
