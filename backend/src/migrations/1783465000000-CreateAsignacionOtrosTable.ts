import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAsignacionOtrosTable1783465000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "asignacion_otros" (
                "id_asig_otros" SERIAL NOT NULL,
                "ci" VARCHAR(20) NOT NULL,
                "nombre" VARCHAR(100) NOT NULL,
                "placa" VARCHAR(20) NOT NULL,
                "telefono" VARCHAR(20) NOT NULL,
                "empresa" VARCHAR(100) NOT NULL,
                "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "CreatedId" INTEGER,
                "UpdatedId" INTEGER,
                "status" BOOLEAN NOT NULL DEFAULT true,
                CONSTRAINT "PK_asignacion_otros" PRIMARY KEY ("id_asig_otros")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "asignacion_otros"
        `);
    }
}