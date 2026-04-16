import { PartialType } from '@nestjs/mapped-types';
import { CreateCierreMensualDto } from './create-cierre-mensual.dto';

export class UpdateCierreMensualDto extends PartialType(CreateCierreMensualDto) {}
