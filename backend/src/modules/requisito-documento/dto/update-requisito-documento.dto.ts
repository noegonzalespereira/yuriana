import { PartialType } from '@nestjs/mapped-types';
import { CreateRequisitoDocumentoDto } from './create-requisito-documento.dto';

export class UpdateRequisitoDocumentoDto extends PartialType(CreateRequisitoDocumentoDto) {}
