import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostalCodeToCompany1783982086000 implements MigrationInterface {
  name = 'AddPostalCodeToCompany1783982086000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE \`company\` ADD \`postalCode\` int NULL`,
      );
    } catch (e) {
      // Ignore if column already exists
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`company\` DROP COLUMN \`postalCode\``,
    );
  }
}
