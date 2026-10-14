import * as SQLite from 'expo-sqlite';
import { AnalysisResult, HistoryFilter, ProgrammingLanguage } from '../domain/types';
import { DatabaseMigrator } from './migrations';

export class AnalysisRepository {
  private static instance: AnalysisRepository;
  private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  private constructor() {}

  public static getInstance(): AnalysisRepository {
    if (!AnalysisRepository.instance) {
      AnalysisRepository.instance = new AnalysisRepository();
    }
    return AnalysisRepository.instance;
  }

  private async getDB(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = (async () => {
        const db = await SQLite.openDatabaseAsync('rootcause_predictor.db');
        await DatabaseMigrator.runMigrations(db);
        return db;
      })();
    }
    return this.dbPromise;
  }

  public async save(result: AnalysisResult): Promise<void> {
    const db = await this.getDB();
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
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM analyses WHERE id = ?;`,
      [id]
    );
    if (!row) return null;
    return this.mapRowToAnalysis(row);
  }

  public async list(filter?: HistoryFilter, limit = 50): Promise<AnalysisResult[]> {
    const db = await this.getDB();
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
    await db.runAsync(
      `UPDATE analyses SET is_favorite = ? WHERE id = ?;`,
      [isFavorite ? 1 : 0, id]
    );
  }

  public async delete(id: string): Promise<void> {
    const db = await this.getDB();
    await db.runAsync(`DELETE FROM analyses WHERE id = ?;`, [id]);
  }

  public async clearAll(): Promise<void> {
    const db = await this.getDB();
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
