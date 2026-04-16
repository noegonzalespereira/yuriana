import { PartialType } from '@nestjs/mapped-types';
import { CreateGastoAdministrativoDto } from './create-gasto-administrativo.dto';

export class UpdateGastoAdministrativoDto extends PartialType(CreateGastoAdministrativoDto) {}
