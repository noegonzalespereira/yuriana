import { PartialType } from '@nestjs/mapped-types';
import { CreateGastoBulkDto } from './create-gasto-bulk.dto';

export class UpdateGastoDto extends PartialType(CreateGastoBulkDto) {}
