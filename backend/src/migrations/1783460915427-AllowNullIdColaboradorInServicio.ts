import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowNullIdColaboradorInServicio1783460915427 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "servicio" ALTER COLUMN "id_colaborador" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "servicio" ALTER COLUMN "id_colaborador" SET NOT NULL`);
    }

}
