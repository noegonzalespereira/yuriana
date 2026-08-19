import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowNullServicioCompletionFields1783462000000 implements MigrationInterface {
  name = "AllowNullServicioCompletionFields1783462000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "servicio"
        ALTER COLUMN "fecha_fin" DROP NOT NULL,
        ALTER COLUMN "periodo_liquidacion" DROP NOT NULL,
        ALTER COLUMN "fecha_limite_pago" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "servicio"
        ALTER COLUMN "fecha_fin" SET NOT NULL,
        ALTER COLUMN "periodo_liquidacion" SET NOT NULL,
        ALTER COLUMN "fecha_limite_pago" SET NOT NULL
    `);
  }
}