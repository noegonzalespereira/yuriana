import { Test, TestingModule } from '@nestjs/testing';
import { RequisitoDocumentoService } from './requisito-documento.service';

describe('RequisitoDocumentoService', () => {
  let service: RequisitoDocumentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequisitoDocumentoService],
    }).compile();

    service = module.get<RequisitoDocumentoService>(RequisitoDocumentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
