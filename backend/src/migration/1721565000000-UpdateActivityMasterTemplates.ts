import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateActivityMasterTemplates1721565000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const updates: { code: string; newTemplate: string }[] = [
      { code: 'USER_LOGIN', newTemplate: 'User {{userEmail}} ({{userGroup}}) logged in' },
      { code: 'USER_LOGOUT', newTemplate: 'User {{userEmail}} ({{userGroup}}) logged out' },
      { code: 'USER_IMPERSONATION', newTemplate: 'User {{userEmail}} ({{userGroup}}) logged in as {{targetEmail}}' },
      { code: 'USER_CREATE', newTemplate: 'User {{userEmail}} ({{userGroup}}) created a new user {{targetEmail}}' },
      { code: 'USER_UPDATE', newTemplate: 'User {{userEmail}} ({{userGroup}}) updated user {{targetEmail}}' },
      { code: 'USER_PASSWORD_CHANGE', newTemplate: 'User {{userEmail}} ({{userGroup}}) changed password' },
      { code: 'COMPANY_CREATE', newTemplate: 'User {{userEmail}} ({{userGroup}}) created company {{companyName}}' },
      { code: 'COMPANY_UPDATE', newTemplate: 'User {{userEmail}} ({{userGroup}}) updated company {{companyName}}' },
      { code: 'GROUP_CREATE', newTemplate: 'User {{userEmail}} ({{userGroup}}) created group {{groupName}}' },
      { code: 'GROUP_UPDATE', newTemplate: 'User {{userEmail}} ({{userGroup}}) updated group {{groupName}}' },
      { code: 'USER_STOP_IMPERSONATION', newTemplate: 'User {{userEmail}} ({{userGroup}}) stopped impersonating {{targetEmail}}' },
      { code: 'CURRENCY_CREATE', newTemplate: 'User {{userEmail}} ({{userGroup}}) created currency {{name}} ({{code}})' },
      { code: 'CURRENCY_UPDATE', newTemplate: 'User {{userEmail}} ({{userGroup}}) updated currency {{name}} ({{code}})' },
    ];

    for (const { code, newTemplate } of updates) {
      // Idempotent: only update if {{userGroup}} is not already in the template
      const rows: any[] = await queryRunner.query(
        `SELECT activityMasterId FROM activity_master WHERE activityCode = ? AND template NOT LIKE '%{{userGroup}}%'`,
        [code],
      );
      if (rows.length > 0) {
        await queryRunner.query(
          `UPDATE activity_master SET template = ? WHERE activityCode = ?`,
          [newTemplate, code],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const reverts: { code: string; originalTemplate: string }[] = [
      { code: 'USER_LOGIN', originalTemplate: 'User {{userEmail}} logged in' },
      { code: 'USER_LOGOUT', originalTemplate: 'User {{userEmail}} logged out' },
      { code: 'USER_IMPERSONATION', originalTemplate: 'User {{userEmail}} logged in as {{targetEmail}}' },
      { code: 'USER_CREATE', originalTemplate: 'User {{userEmail}} created a new user {{targetEmail}}' },
      { code: 'USER_UPDATE', originalTemplate: 'User {{userEmail}} updated user {{targetEmail}}' },
      { code: 'USER_PASSWORD_CHANGE', originalTemplate: 'User {{userEmail}} changed password' },
      { code: 'COMPANY_CREATE', originalTemplate: 'User {{userEmail}} created company {{companyName}}' },
      { code: 'COMPANY_UPDATE', originalTemplate: 'User {{userEmail}} updated company {{companyName}}' },
      { code: 'GROUP_CREATE', originalTemplate: 'User {{userEmail}} created group {{groupName}}' },
      { code: 'GROUP_UPDATE', originalTemplate: 'User {{userEmail}} updated group {{groupName}}' },
      { code: 'USER_STOP_IMPERSONATION', originalTemplate: 'User {{userEmail}} stopped impersonating {{targetEmail}}' },
      { code: 'CURRENCY_CREATE', originalTemplate: 'User {{userEmail}} created currency {{name}} ({{code}})' },
      { code: 'CURRENCY_UPDATE', originalTemplate: 'User {{userEmail}} updated currency {{name}} ({{code}})' },
    ];

    for (const { code, originalTemplate } of reverts) {
      await queryRunner.query(
        `UPDATE activity_master SET template = ? WHERE activityCode = ?`,
        [originalTemplate, code],
      );
    }
  }
}
