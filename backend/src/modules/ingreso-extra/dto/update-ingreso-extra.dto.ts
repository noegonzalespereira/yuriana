import { PartialType } from '@nestjs/mapped-types';
import { CreateIngresoExtraDto } from './create-ingreso-extra.dto';

export class UpdateIngresoExtraDto extends PartialType(CreateIngresoExtraDto) {}
