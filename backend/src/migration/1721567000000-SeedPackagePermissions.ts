import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPackagePermissions1721567000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed package permissions
    await queryRunner.query(`
      INSERT IGNORE INTO permissions (permissionName, module, label) VALUES
      ('packageList', 'package', 'Package List'),
      ('packageView', 'package', 'Package View'),
      ('packageAdd', 'package', 'Package Add'),
      ('packageUpdate', 'package', 'Package Update');
    `);

    // Seed activity master entries
    await queryRunner.query(`
      INSERT IGNORE INTO activity_master (activityCode, activityName, module, defaultSeverity, template, description, isActive) VALUES
      ('PACKAGE_CREATE', 'Package Created', 'Master', 'INFO', 'User {{userEmail}} created package {{packageName}} (Code: {{packageCode}})', 'Package Created', true),
      ('PACKAGE_UPDATE', 'Package Updated', 'Master', 'INFO', 'User {{userEmail}} updated package {{packageName}} (Code: {{packageCode}})', 'Package Updated', true);
    `);

    // Assign package permissions to superAdmin group
    await queryRunner.query(`
      INSERT IGNORE INTO group_permissions (groupId, permissionId)
      SELECT g.groupId, p.permissionId
      FROM \`group\` g
      CROSS JOIN permissions p
      WHERE g.groupName = 'superAdmin'
        AND p.permissionName IN ('packageList', 'packageView', 'packageAdd', 'packageUpdate');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM permissions WHERE module = 'package';
    `);
    await queryRunner.query(`
      DELETE FROM activity_master WHERE activityCode IN ('PACKAGE_CREATE', 'PACKAGE_UPDATE');
    `);
  }
}
