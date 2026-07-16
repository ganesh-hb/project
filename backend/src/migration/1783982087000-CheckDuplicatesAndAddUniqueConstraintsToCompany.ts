import { MigrationInterface, QueryRunner } from 'typeorm';

export class CheckDuplicatesAndAddUniqueConstraintsToCompany1783982087000 implements MigrationInterface {
  name = 'CheckDuplicatesAndAddUniqueConstraintsToCompany1783982087000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Check for existing duplicate companyCode values
    const duplicateCodes: {
      companyCode: string;
      count: number;
      companyIds: string;
    }[] = await queryRunner.query(`
            SELECT \`companyCode\`, COUNT(*) as \`count\`, GROUP_CONCAT(\`companyId\`) as \`companyIds\`
            FROM \`company\`
            GROUP BY \`companyCode\`
            HAVING COUNT(*) > 1
        `);

    // 2. Check for existing duplicate email values
    const duplicateEmails: {
      email: string;
      count: number;
      companyIds: string;
    }[] = await queryRunner.query(`
            SELECT \`email\`, COUNT(*) as \`count\`, GROUP_CONCAT(\`companyId\`) as \`companyIds\`
            FROM \`company\`
            GROUP BY \`email\`
            HAVING COUNT(*) > 1
        `);

    let errorMessage = '';

    if (duplicateCodes.length > 0) {
      errorMessage +=
        'Duplicate companyCode values found: ' +
        duplicateCodes
          .map(
            (row) => `'${row.companyCode}' in companyIds: [${row.companyIds}]`,
          )
          .join(', ') +
        '. ';
    }

    if (duplicateEmails.length > 0) {
      errorMessage +=
        'Duplicate email values found: ' +
        duplicateEmails
          .map((row) => `'${row.email}' in companyIds: [${row.companyIds}]`)
          .join(', ') +
        '. ';
    }

    if (errorMessage) {
      throw new Error(
        `Migration failed: Unique constraint check failed. ${errorMessage}Please resolve these duplicates manually before running migrations.`,
      );
    }

    // 3. Add UQ_company_companyCode
    try {
      await queryRunner.query(
        `ALTER TABLE \`company\` ADD CONSTRAINT \`UQ_company_companyCode\` UNIQUE (\`companyCode\`)`,
      );
    } catch (e) {
      // Ignore if index already exists
    }

    // 4. Add UQ_company_email
    try {
      await queryRunner.query(
        `ALTER TABLE \`company\` ADD CONSTRAINT \`UQ_company_email\` UNIQUE (\`email\`)`,
      );
    } catch (e) {
      // Ignore if index already exists
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`company\` DROP INDEX \`UQ_company_companyCode\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`company\` DROP INDEX \`UQ_company_email\``,
    );
  }
}
