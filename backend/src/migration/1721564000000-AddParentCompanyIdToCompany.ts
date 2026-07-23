// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class AddParentCompanyIdToCompany1721564000000
//   implements MigrationInterface
// {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     // ADD COLUMN IF NOT EXISTS is not reliably supported by all MySQL 8.0 builds.
//     // Instead, check INFORMATION_SCHEMA first so this migration is idempotent.
//     const [rows] = await queryRunner.query(
//       `SELECT COUNT(*) AS cnt
//        FROM information_schema.COLUMNS
//        WHERE TABLE_SCHEMA = DATABASE()
//          AND TABLE_NAME   = 'company'
//          AND COLUMN_NAME  = 'parentCompanyId'`,
//     );
//     if (Number(rows.cnt) === 0) {
//       await queryRunner.query(
//         `ALTER TABLE \`company\` ADD COLUMN \`parentCompanyId\` INT NULL DEFAULT NULL`,
//       );
//     }

//     // Add the FK only if it doesn't already exist.
//     const [fkRows] = await queryRunner.query(
//       `SELECT COUNT(*) AS cnt
//        FROM information_schema.TABLE_CONSTRAINTS
//        WHERE TABLE_SCHEMA    = DATABASE()
//          AND TABLE_NAME      = 'company'
//          AND CONSTRAINT_NAME = 'FK_company_parentCompanyId'
//          AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
//     );
//     if (Number(fkRows.cnt) === 0) {
//       await queryRunner.query(
//         `ALTER TABLE \`company\` ADD CONSTRAINT \`FK_company_parentCompanyId\`
//          FOREIGN KEY (\`parentCompanyId\`) REFERENCES \`company\`(\`companyId\`) ON DELETE SET NULL`,
//       );
//     }
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(
//       `ALTER TABLE \`company\` DROP FOREIGN KEY \`FK_company_parentCompanyId\``,
//     );
//     await queryRunner.query(
//       `ALTER TABLE \`company\` DROP COLUMN \`parentCompanyId\``,
//     );
//   }
// }
