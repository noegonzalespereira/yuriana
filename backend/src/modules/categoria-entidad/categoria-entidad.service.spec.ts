import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaEntidadService } from './categoria-entidad.service';

describe('CategoriaEntidadService', () => {
  let service: CategoriaEntidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriaEntidadService],
    }).compile();

    service = module.get<CategoriaEntidadService>(CategoriaEntidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
