import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { runMigrations } from './db/index.js';
import { twinRoutes } from './routes/twins.js';
import { simulationRoutes } from './routes/simulations.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const app = Fastify({ logger: { level: 'info' } });

await app.register(cors, {
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
await app.register(twinRoutes);
await app.register(simulationRoutes);

// Start
runMigrations();

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`\n🚀 TwinForge API running at http://localhost:${PORT}`);
  console.log(`   Claude API: ${process.env.ANTHROPIC_API_KEY ? '✅ Connected' : '⚠️  Mock mode (set ANTHROPIC_API_KEY to enable)'}\n`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
