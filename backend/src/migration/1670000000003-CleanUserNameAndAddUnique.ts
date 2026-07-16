import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Clean up invalid usernames (NULL or empty) and enforce uniqueness.
 *
 *   1. SELECT userId FROM `user` WHERE name IS NULL OR name = '';
 *   2. For each returned userId, set name = `user_<userId>`.
 *   3. Add a UNIQUE index on the `name` column.
 *
 * The down migration only drops the unique index – the generated usernames are
 * retained because they are harmless and reverting them could re‑introduce
 * duplicates.
 */
export class CleanUserNameAndAddUnique1670000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // -------------------------------------------------
    // 1️⃣ Find rows with NULL or empty usernames
    // -------------------------------------------------
    const rows: { userId: number }[] = await queryRunner.query(
      `SELECT userId FROM \`user\` WHERE name IS NULL OR name = ''`,
    );

    // -------------------------------------------------
    // 2️⃣ Assign a deterministic unique name for each invalid row
    // -------------------------------------------------
    for (const { userId } of rows) {
      const newName = `user_${userId}`;
      await queryRunner.query(`UPDATE \`user\` SET name = ? WHERE userId = ?`, [
        newName,
        userId,
      ]);
    }

    // -------------------------------------------------
    // 3️⃣ Add the UNIQUE constraint on the `name` column
    // -------------------------------------------------
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`UQ_user_name\` UNIQUE (name)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // -------------------------------------------------
    // Remove the unique index (keep the generated usernames)
    // -------------------------------------------------
    await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`UQ_user_name\``);
  }
}
