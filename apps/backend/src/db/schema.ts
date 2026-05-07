import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const twins = sqliteTable('twins', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  modelId: text('model_id').notNull(),
  category: text('category').notNull(), // 'human' | 'industrial'
  params: text('params').notNull(), // JSON
  healthScore: real('health_score').notNull().default(0),
  simulationCount: integer('simulation_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const simulations = sqliteTable('simulations', {
  id: text('id').primaryKey(),
  twinId: text('twin_id').notNull().references(() => twins.id, { onDelete: 'cascade' }),
  twinName: text('twin_name').notNull(),
  scenarioId: text('scenario_id').notNull(),
  scenarioName: text('scenario_name').notNull(),
  overallRisk: text('overall_risk').notNull(), // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: text('status').notNull().default('running'), // 'running' | 'complete' | 'error'
  report: text('report'), // JSON | null
  createdAt: text('created_at').notNull(),
});
