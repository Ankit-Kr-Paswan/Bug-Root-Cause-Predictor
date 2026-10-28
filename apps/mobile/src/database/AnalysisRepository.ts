import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { AnalysisResult, HistoryFilter, ProgrammingLanguage } from '../domain/types';
import { DatabaseMigrator } from './migrations';

const WEB_STORAGE_KEY = 'rootcause_analyses_history';

export class AnalysisRepository {
  private static instance: AnalysisRepository;
  private dbPromise: Promise<SQLite.SQLiteDatabase | null> | null = null;
  private useWebStorageFallback = false;

  private constructor() {}

  public static getInstance(): AnalysisRepository {
    if (!AnalysisRepository.instance) {
      AnalysisRepository.instance = new AnalysisRepository();
    }
    return AnalysisRepository.instance;
  }

  private async getDB(): Promise<SQLite.SQLiteDatabase | null> {
    if (this.useWebStorageFallback) return null;

    if (!this.dbPromise) {
      this.dbPromise = (async () => {
        try {
          const db = await SQLite.openDatabaseAsync('rootcause_predictor.db');
          await DatabaseMigrator.runMigrations(db);
          return db;
        } catch (err) {
          if (Platform.OS === 'web') {
            console.warn(
              'expo-sqlite web worker/WASM unavailable, using web storage fallback:',
              err
            );
            this.useWebStorageFallback = true;
            return null;
          }
          throw err;
        }
      })();
    }
    return this.dbPromise;
  }

  // Web storage fallback helpers
  private getWebRecords(): AnalysisResult[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(WEB_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      }
    } catch {
      // ignore
    }
    return [];
  }

  private setWebRecords(records: AnalysisResult[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(records));
      }
    } catch {
      // ignore
    }
  }

  public async save(result: AnalysisResult): Promise<void> {
    const db = await this.getDB();
    if (!db) {
      const records = this.getWebRecords();
      const filtered = records.filter((r) => r.id !== result.id);
      this.setWebRecords([result, ...filtered]);
      return;
    }

    await db.runAsync(
      `INSERT OR REPLACE INTO analyses (
        id, created_at, language, category, summary, original_input,
        parsed_info_json, candidates_json, limitations_json,
        engine_type, engine_version, is_favorite, is_redacted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        result.id,
        result.createdAt,
        result.language,
        result.category,
        result.summary,
        result.originalInput,
        JSON.stringify(result.parsedInfo),
        JSON.stringify(result.candidates),
        JSON.stringify(result.limitations),
        result.engineType,
        result.engineVersion,
        result.isFavorite ? 1 : 0,
        result.parsedInfo.isRedacted ? 1 : 0,
      ]
    );
  }

  public async getById(id: string): Promise<AnalysisResult | null> {
    const db = await this.getDB();
    if (!db) {
      const records = this.getWebRecords();
      return records.find((r) => r.id === id) || null;
    }

    const row = await db.getFirstAsync<any>(
      `SELECT * FROM analyses WHERE id = ?;`,
      [id]
    );
    if (!row) return null;
    return this.mapRowToAnalysis(row);
  }

  public async list(filter?: HistoryFilter, limit = 50): Promise<AnalysisResult[]> {
    const db = await this.getDB();
    if (!db) {
      let records = this.getWebRecords();
      if (filter?.searchQuery && filter.searchQuery.trim().length > 0) {
        const q = filter.searchQuery.toLowerCase().trim();
        records = records.filter(
          (r) =>
            r.summary.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            r.originalInput.toLowerCase().includes(q)
        );
      }
      if (filter?.language && filter.language !== 'unknown') {
        records = records.filter((r) => r.language === filter.language);
      }
      if (filter?.category) {
        records = records.filter((r) => r.category === filter.category);
      }
      if (filter?.isFavorite) {
        records = records.filter((r) => Boolean(r.isFavorite));
      }
      return records.slice(0, limit);
    }

    let query = `SELECT * FROM analyses WHERE 1=1`;
    const params: any[] = [];

    if (filter?.searchQuery && filter.searchQuery.trim().length > 0) {
      query += ` AND (summary LIKE ? OR category LIKE ? OR original_input LIKE ?)`;
      const term = `%${filter.searchQuery.trim()}%`;
      params.push(term, term, term);
    }

    if (filter?.language && filter.language !== 'unknown') {
      query += ` AND language = ?`;
      params.push(filter.language);
    }

    if (filter?.category) {
      query += ` AND category = ?`;
      params.push(filter.category);
    }

    if (filter?.isFavorite) {
      query += ` AND is_favorite = 1`;
    }

    query += ` ORDER BY created_at DESC LIMIT ?;`;
    params.push(limit);

    const rows = await db.getAllAsync<any>(query, params);
    return rows.map((r) => this.mapRowToAnalysis(r));
  }

  public async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const db = await this.getDB();
    if (!db) {
      const records = this.getWebRecords();
      const updated = records.map((r) =>
        r.id === id ? { ...r, isFavorite } : r
      );
      this.setWebRecords(updated);
      return;
    }

    await db.runAsync(
      `UPDATE analyses SET is_favorite = ? WHERE id = ?;`,
      [isFavorite ? 1 : 0, id]
    );
  }

  public async delete(id: string): Promise<void> {
    const db = await this.getDB();
    if (!db) {
      const records = this.getWebRecords();
      this.setWebRecords(records.filter((r) => r.id !== id));
      return;
    }

    await db.runAsync(`DELETE FROM analyses WHERE id = ?;`, [id]);
  }

  public async clearAll(): Promise<void> {
    const db = await this.getDB();
    if (!db) {
      this.setWebRecords([]);
      return;
    }

    await db.runAsync(`DELETE FROM analyses;`);
  }

  private mapRowToAnalysis(row: any): AnalysisResult {
    return {
      id: row.id,
      createdAt: row.created_at,
      language: row.language as ProgrammingLanguage,
      category: row.category,
      summary: row.summary,
      originalInput: row.original_input,
      parsedInfo: JSON.parse(row.parsed_info_json || '{}'),
      candidates: JSON.parse(row.candidates_json || '[]'),
      limitations: JSON.parse(row.limitations_json || '[]'),
      engineType: row.engine_type,
      engineVersion: row.engine_version,
      isFavorite: Boolean(row.is_favorite),
    };
  }
}
