import { Test, TestingModule } from '@nestjs/testing';
import { RequisitoDocumentoController } from './requisito-documento.controller';
import { RequisitoDocumentoService } from './requisito-documento.service';

describe('RequisitoDocumentoController', () => {
  let controller: RequisitoDocumentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequisitoDocumentoController],
      providers: [RequisitoDocumentoService],
    }).compile();

    controller = module.get<RequisitoDocumentoController>(RequisitoDocumentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
