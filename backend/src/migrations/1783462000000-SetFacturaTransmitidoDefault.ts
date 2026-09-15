import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetFacturaTransmitidoDefault1783462000000 implements MigrationInterface {
  name = 'SetFacturaTransmitidoDefault1783462000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('factura', 'transmitido')) {
      await queryRunner.query(`UPDATE "factura" SET "transmitido" = true WHERE "transmitido" IS NULL`);
      await queryRunner.query(`ALTER TABLE "factura" ALTER COLUMN "transmitido" SET DEFAULT true`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('factura', 'transmitido')) {
      await queryRunner.query(`ALTER TABLE "factura" ALTER COLUMN "transmitido" SET DEFAULT false`);
    }
  }
}
