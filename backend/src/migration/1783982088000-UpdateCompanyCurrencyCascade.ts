import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompanyCurrencyCascade1783982088000 implements MigrationInterface {
  name = 'UpdateCompanyCurrencyCascade1783982088000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing foreign key constraints if they exist
    try {
      await queryRunner.query(
        `ALTER TABLE \`company_currency\` DROP FOREIGN KEY \`FK_7389c4969d40b64e888619bf7ae\``,
      );
    } catch (e) {
      // Ignore if constraint doesn't exist
    }
    try {
      await queryRunner.query(
        `ALTER TABLE \`company_currency\` DROP FOREIGN KEY \`FK_d67539aca4de17c01c80980840b\``,
      );
    } catch (e) {
      // Ignore if constraint doesn't exist
    }

    // Add constraints with ON DELETE CASCADE
    await queryRunner.query(
      `ALTER TABLE \`company_currency\` ADD CONSTRAINT \`FK_7389c4969d40b64e888619bf7ae\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`companyId\`) ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`company_currency\` ADD CONSTRAINT \`FK_d67539aca4de17c01c80980840b\` FOREIGN KEY (\`curId\`) REFERENCES \`currency\`(\`curId\`) ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE \`company_currency\` DROP FOREIGN KEY \`FK_7389c4969d40b64e888619bf7ae\``,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `ALTER TABLE \`company_currency\` DROP FOREIGN KEY \`FK_d67539aca4de17c01c80980840b\``,
      );
    } catch (e) {}

    await queryRunner.query(
      `ALTER TABLE \`company_currency\` ADD CONSTRAINT \`FK_7389c4969d40b64e888619bf7ae\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`companyId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`company_currency\` ADD CONSTRAINT \`FK_d67539aca4de17c01c80980840b\` FOREIGN KEY (\`curId\`) REFERENCES \`currency\`(\`curId\`)`,
    );
  }
}
