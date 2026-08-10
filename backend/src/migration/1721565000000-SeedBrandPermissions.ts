import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBrandPermissions1721565000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed manufacturer and brand permissions
    await queryRunner.query(`
      INSERT IGNORE INTO permissions (permissionName, module, label) VALUES
      ('manufacturerList', 'manufacturer', 'Manufacturer List'),
      ('manufacturerView', 'manufacturer', 'Manufacturer View'),
      ('manufacturerAdd', 'manufacturer', 'Manufacturer Add'),
      ('manufacturerUpdate', 'manufacturer', 'Manufacturer Update'),
      ('brandList', 'brand', 'Brand List'),
      ('brandView', 'brand', 'Brand View'),
      ('brandAdd', 'brand', 'Brand Add'),
      ('brandUpdate', 'brand', 'Brand Update');
    `);

    // Seed activity master entries with correct column schema
    await queryRunner.query(`
      INSERT IGNORE INTO activity_master (activityCode, activityName, module, defaultSeverity, template, description, isActive) VALUES
      ('BRAND_CREATE', 'Brand Created', 'Master', 'INFO', 'User {{userEmail}} created brand {{brandName}} (Code: {{brandCode}})', 'Brand Created', true),
      ('BRAND_UPDATE', 'Brand Updated', 'Master', 'INFO', 'User {{userEmail}} updated brand {{brandName}} (Code: {{brandCode}})', 'Brand Updated', true);
    `);

    // Assign manufacturer and brand permissions to superAdmin group
    await queryRunner.query(`
      INSERT IGNORE INTO group_permissions (groupId, permissionId)
      SELECT g.groupId, p.permissionId
      FROM \`group\` g
      CROSS JOIN permissions p
      WHERE g.groupName = 'superAdmin'
        AND p.permissionName IN (
          'manufacturerList', 'manufacturerView', 'manufacturerAdd', 'manufacturerUpdate',
          'brandList', 'brandView', 'brandAdd', 'brandUpdate'
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM permissions WHERE module = 'brand';
    `);
    await queryRunner.query(`
      DELETE FROM activity_master WHERE activityCode IN ('BRAND_CREATE', 'BRAND_UPDATE');
    `);
  }
}
