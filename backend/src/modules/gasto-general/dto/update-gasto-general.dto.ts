import { PartialType } from '@nestjs/mapped-types';
import { CreateGastoGeneralDto } from './create-gasto-general.dto';

export class UpdateGastoGeneralDto extends PartialType(CreateGastoGeneralDto) {}
