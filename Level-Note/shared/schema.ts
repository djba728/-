import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Dummy table for backend (app uses LocalStorage)
export const app_data = pgTable("app_data", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
});

// ============================================================
// ZOD SCHEMAS FOR LOCALSTORAGE (HI Method / 器械高方式)
// ============================================================

/**
 * HI方式（器械高方式）による水準測量のデータ構造
 * 
 * LocalStorage Keys:
 * - 'hi_survey_session': 現在のセッション
 * - 'hi_saved_benchmarks': 保存された既知点リスト
 */

// 測点タイプ
export type StationType = 'benchmark' | 'foresight';

// 測点行データ
export const surveyRowSchema = z.object({
  id: z.string(),
  rowNumber: z.number(),
  setNumber: z.string().default("SET-1"), // 据付番号
  type: z.enum(['benchmark', 'foresight']).default('foresight'),
  stationName: z.string().default(""),
  
  // 基準点用（BM）
  knownElevation: z.number().nullable().optional(), // 既知標高
  bs: z.number().nullable().optional(), // 後視（BSは基準点のみ）
  
  // FS点用
  fs: z.number().nullable().optional(), // 前視（FSはFS点のみ）
  
  // 計算結果
  hi: z.number().nullable().optional(), // 器械高 = 既知標高 + BS（基準点のみ）
  elevation: z.number().nullable().optional(), // 標高 = HI - FS（FS点のみ）
  
  note: z.string().default("").optional(),
});

// セッションデータ
export const surveySessionSchema = z.object({
  id: z.string(),
  siteName: z.string().default(""),
  date: z.string().default(new Date().toISOString().split('T')[0]),
  surveyor: z.string().default(""),
  rows: z.array(surveyRowSchema).default([]),
  currentHI: z.number().nullable().optional(), // 現在のHI（基準点から算出）
  lastUpdated: z.string().optional(),
});

// 保存された既知点
export const savedBenchmarkSchema = z.object({
  id: z.string(),
  name: z.string(),
  elevation: z.number(),
  lastUsed: z.string(),
});

export type SurveyRow = z.infer<typeof surveyRowSchema>;
export type SurveySession = z.infer<typeof surveySessionSchema>;
export type SavedBenchmark = z.infer<typeof savedBenchmarkSchema>;

// Insert schemas for DB (not used but required for build)
export const insertAppDataSchema = createInsertSchema(app_data).omit({ id: true });
export type InsertAppData = z.infer<typeof insertAppDataSchema>;

// Keep legacy types for build compatibility
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});
export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
