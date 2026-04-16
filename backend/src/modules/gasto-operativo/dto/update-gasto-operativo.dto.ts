import { PartialType } from '@nestjs/mapped-types';
import { CreateGastoOperativoDto } from './create-gasto-operativo.dto';

export class UpdateGastoOperativoDto extends PartialType(CreateGastoOperativoDto) {}
