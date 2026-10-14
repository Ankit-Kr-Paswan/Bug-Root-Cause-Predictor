import * as SQLite from 'expo-sqlite';
import {
  CREATE_ANALYSIS_INDEXES_V1,
  CREATE_ANALYSIS_TABLE_V1,
  CREATE_APP_METADATA_TABLE,
  CURRENT_DB_VERSION,
} from './schema';

export class DatabaseMigrator {
  public static async runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.execAsync(CREATE_APP_METADATA_TABLE);

    const versionRow = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM db_metadata WHERE key = 'schema_version';"
    );

    const installedVersion = versionRow ? parseInt(versionRow.value, 10) : 0;

    if (installedVersion < 1) {
      await db.withTransactionAsync(async () => {
        await db.execAsync(CREATE_ANALYSIS_TABLE_V1);
        await db.execAsync(CREATE_ANALYSIS_INDEXES_V1);
        await db.runAsync(
          "INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('schema_version', ?);",
          [String(CURRENT_DB_VERSION)]
        );
      });
    }
  }
}
