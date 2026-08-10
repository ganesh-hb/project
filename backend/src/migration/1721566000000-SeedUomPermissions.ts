import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUomPermissions1721566000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed UOM permissions
    await queryRunner.query(`
      INSERT IGNORE INTO permissions (permissionName, module, label) VALUES
      ('uomList', 'uom', 'UOM List'),
      ('uomView', 'uom', 'UOM View'),
      ('uomAdd', 'uom', 'UOM Add'),
      ('uomUpdate', 'uom', 'UOM Update');
    `);

    // Seed activity master entries
    await queryRunner.query(`
      INSERT IGNORE INTO activity_master (activityCode, activityName, module, defaultSeverity, template, description, isActive) VALUES
      ('UOM_CREATE', 'UOM Created', 'Master', 'INFO', 'User {{userEmail}} created UOM {{uomName}} (Code: {{uomCode}})', 'UOM Created', true),
      ('UOM_UPDATE', 'UOM Updated', 'Master', 'INFO', 'User {{userEmail}} updated UOM {{uomName}} (Code: {{uomCode}})', 'UOM Updated', true);
    `);

    // Assign UOM permissions to superAdmin group
    await queryRunner.query(`
      INSERT IGNORE INTO group_permissions (groupId, permissionId)
      SELECT g.groupId, p.permissionId
      FROM \`group\` g
      CROSS JOIN permissions p
      WHERE g.groupName = 'superAdmin'
        AND p.permissionName IN ('uomList', 'uomView', 'uomAdd', 'uomUpdate');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM permissions WHERE module = 'uom';
    `);
    await queryRunner.query(`
      DELETE FROM activity_master WHERE activityCode IN ('UOM_CREATE', 'UOM_UPDATE');
    `);
  }
}
