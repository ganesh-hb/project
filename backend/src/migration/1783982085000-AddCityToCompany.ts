import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCityToCompany1783982085000 implements MigrationInterface {
    name = 'AddCityToCompany1783982085000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`city\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`city\``);
    }
}
