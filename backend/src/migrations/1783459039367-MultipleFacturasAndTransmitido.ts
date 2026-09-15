import { MigrationInterface, QueryRunner } from "typeorm";

export class MultipleFacturasAndTransmitido1783459039367 implements MigrationInterface {
  name = "MultipleFacturasAndTransmitido1783459039367";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("factura", "transmitido");
    if (!hasColumn) {
      await queryRunner.query(`ALTER TABLE "factura" ADD "transmitido" boolean NOT NULL DEFAULT true`);
      await queryRunner.query(`UPDATE "factura" SET "transmitido" = true WHERE "status" = true`);
    }

    await queryRunner.query(`ALTER TABLE "factura" DROP CONSTRAINT IF EXISTS "UQ_factura_id_servicio"`);
    await queryRunner.query(`ALTER TABLE "factura" DROP CONSTRAINT IF EXISTS "factura_id_servicio_key"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "factura" ADD CONSTRAINT "UQ_factura_id_servicio" UNIQUE ("id_servicio")`);
    await queryRunner.query(`ALTER TABLE "factura" DROP COLUMN IF EXISTS "transmitido"`);
  }
}