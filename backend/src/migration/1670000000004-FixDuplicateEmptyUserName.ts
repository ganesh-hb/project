import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fix duplicate empty usernames and enforce a proper unique constraint.
 *
 * Steps:
 *   1️⃣ Drop the previously generated (broken) index `IDX_065d4d8f3b5adb4a08841eae3c`
 *      on the `name` column – ignore errors if it does not exist.
 *   2️⃣ Find all rows where `name` IS NULL OR `name` = ''.
 *   3️⃣ For each such row set `name` = `user_<userId>` (deterministic unique value).
 *   4️⃣ Add a new UNIQUE constraint `UQ_user_name` on the `name` column.
 *
 * The down migration removes the unique constraint (but keeps the generated
 * usernames because reverting could re‑introduce duplicates). It also attempts
 * to recreate the old index – this is optional and safe to ignore.
 */
export class FixDuplicateEmptyUserName1670000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // -------------------------------------------------
    // 1️⃣ Drop the old broken index (if it exists)
    // -------------------------------------------------
    try {
      await queryRunner.query(
        `ALTER TABLE \`user\` DROP INDEX \`IDX_065d4d8f3b5adb4a08841eae3c\``,
      );
    } catch (e) {
      // Index might not exist – ignore.
    }

    // -------------------------------------------------
    // 2️⃣ Find rows with NULL or empty usernames
    // -------------------------------------------------
    const rows: { userId: number }[] = await queryRunner.query(
      `SELECT userId FROM \`user\` WHERE name IS NULL OR name = ''`,
    );

    // -------------------------------------------------
    // 3️⃣ Assign a deterministic unique name for each invalid row
    // -------------------------------------------------
    for (const { userId } of rows) {
      const newName = `user_${userId}`;
      await queryRunner.query(`UPDATE \`user\` SET name = ? WHERE userId = ?`, [
        newName,
        userId,
      ]);
    }

    // -------------------------------------------------
    // 4️⃣ Add the proper UNIQUE constraint on `name`
    // -------------------------------------------------
    try {
      await queryRunner.query(
        `ALTER TABLE \`user\` ADD CONSTRAINT \`UQ_user_name\` UNIQUE (name)`,
      );
    } catch (e) {
      // Ignore if index already exists
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // -------------------------------------------------
    // Remove the unique constraint added in up()
    // -------------------------------------------------
    await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`UQ_user_name\``);
    // Optionally recreate the old broken index (not required for prod)
    try {
      await queryRunner.query(
        `ALTER TABLE \`user\` ADD INDEX \`IDX_065d4d8f3b5adb4a08841eae3c\` (name)`,
      );
    } catch (e) {
      // ignore if fails
    }
  }
}
