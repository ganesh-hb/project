import { MigrationInterface, QueryRunner } from "typeorm";

export class ActivitySchema1783489548005 implements MigrationInterface {
    name = 'ActivitySchema1783489548005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity_log\` CHANGE \`status\` \`executionStatus\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity_master\` CHANGE \`status\` \`isActive\` varchar(255) NOT NULL DEFAULT 'Active'`);
        await queryRunner.query(`ALTER TABLE \`activity_log\` DROP COLUMN \`executionStatus\``);
        await queryRunner.query(`ALTER TABLE \`activity_log\` ADD \`executionStatus\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity_master\` DROP COLUMN \`isActive\``);
        await queryRunner.query(`ALTER TABLE \`activity_master\` ADD \`isActive\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`CREATE INDEX \`idx_correlationId\` ON \`activity_log\` (\`correlationId\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_target_type_id\` ON \`activity_log\` (\`targetType\`, \`targetId\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_companyId\` ON \`activity_log\` (\`companyId\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_activityMaster_createdAt\` ON \`activity_log\` (\`activityMasterId\`, \`createdAt\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_user_createdAt\` ON \`activity_log\` (\`userId\`, \`createdAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_user_createdAt\` ON \`activity_log\``);
        await queryRunner.query(`DROP INDEX \`idx_activityMaster_createdAt\` ON \`activity_log\``);
        await queryRunner.query(`DROP INDEX \`idx_companyId\` ON \`activity_log\``);
        await queryRunner.query(`DROP INDEX \`idx_target_type_id\` ON \`activity_log\``);
        await queryRunner.query(`DROP INDEX \`idx_correlationId\` ON \`activity_log\``);
        await queryRunner.query(`ALTER TABLE \`activity_master\` DROP COLUMN \`isActive\``);
        await queryRunner.query(`ALTER TABLE \`activity_master\` ADD \`isActive\` varchar(255) NOT NULL DEFAULT 'Active'`);
        await queryRunner.query(`ALTER TABLE \`activity_log\` DROP COLUMN \`executionStatus\``);
        await queryRunner.query(`ALTER TABLE \`activity_log\` ADD \`executionStatus\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity_master\` CHANGE \`isActive\` \`status\` varchar(255) NOT NULL DEFAULT 'Active'`);
        await queryRunner.query(`ALTER TABLE \`activity_log\` CHANGE \`executionStatus\` \`status\` varchar(255) NOT NULL`);
    }

}
