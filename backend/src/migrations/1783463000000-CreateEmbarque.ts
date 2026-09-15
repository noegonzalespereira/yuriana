import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmbarque1783463000000 implements MigrationInterface {
  name = 'CreateEmbarque1783463000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "embarque" (
        "id_embarque" SERIAL NOT NULL,
        "crt" character varying NOT NULL,
        "total_unidades" integer NOT NULL,
        "unidades_restantes" integer NOT NULL,
        "visible" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "CreatedId" integer,
        "UpdatedId" integer,
        "status" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_embarque_id" PRIMARY KEY ("id_embarque"),
        CONSTRAINT "UQ_embarque_crt" UNIQUE ("crt"),
        CONSTRAINT "CK_embarque_unidades" CHECK ("total_unidades" > 0 AND "unidades_restantes" >= 0 AND "unidades_restantes" <= "total_unidades")
      )
    `);
    if (!(await queryRunner.hasColumn('servicio', 'id_embarque'))) {
      await queryRunner.query(`ALTER TABLE "servicio" ADD "id_embarque" integer`);
    }

    await queryRunner.query(`
      INSERT INTO "embarque" ("crt", "total_unidades", "unidades_restantes", "visible", "status")
      SELECT DISTINCT ON (TRIM(s."crt"))
        TRIM(s."crt"),
        COUNT(*) OVER (PARTITION BY TRIM(s."crt"))::integer,
        0,
        false,
        true
      FROM "servicio" s
      WHERE s."crt" IS NOT NULL
        AND TRIM(s."crt") <> ''
        AND NOT EXISTS (
          SELECT 1 FROM "embarque" e WHERE e."crt" = TRIM(s."crt")
        )
    `);

    await queryRunner.query(`
      UPDATE "servicio" s
      SET "id_embarque" = e."id_embarque"
      FROM "embarque" e
      WHERE s."id_embarque" IS NULL
        AND s."crt" IS NOT NULL
        AND TRIM(s."crt") = e."crt"
    `);

    const foreignKeyExists = await queryRunner.query(`
      SELECT 1 FROM pg_constraint WHERE conname = 'FK_servicio_embarque'
    `);
    if (!foreignKeyExists.length) {
      await queryRunner.query(`ALTER TABLE "servicio" ADD CONSTRAINT "FK_servicio_embarque" FOREIGN KEY ("id_embarque") REFERENCES "embarque"("id_embarque") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "servicio" DROP CONSTRAINT IF EXISTS "FK_servicio_embarque"`);
    await queryRunner.query(`ALTER TABLE "servicio" DROP COLUMN IF EXISTS "id_embarque"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "embarque"`);
  }
}