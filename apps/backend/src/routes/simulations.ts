import type { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { simulations } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { runSimulation } from '../services/claude.js';
import type { ScenarioPreset } from '@twinforge/shared';

export async function simulationRoutes(app: FastifyInstance) {
  // GET /api/simulations
  app.get<{ Querystring: { twinId?: string } }>('/api/simulations', async (req) => {
    const rows = req.query.twinId
      ? await db.select().from(simulations).where(eq(simulations.twinId, req.query.twinId))
      : await db.select().from(simulations);
    return rows.map((r) => ({
      ...r,
      report: r.report ? JSON.parse(r.report) : null,
    }));
  });

  // GET /api/simulations/:id
  app.get<{ Params: { id: string } }>('/api/simulations/:id', async (req, reply) => {
    const [row] = await db.select().from(simulations).where(eq(simulations.id, req.params.id));
    if (!row) return reply.status(404).send({ error: 'Not found' });
    return { ...row, report: row.report ? JSON.parse(row.report) : null };
  });

  // POST /api/simulations — start simulation
  app.post<{
    Body: {
      twinId: string;
      twinName: string;
      scenarioId: string;
      scenarioName: string;
      category: string;
      params: object;
      scenario: ScenarioPreset;
    };
  }>('/api/simulations', async (req, reply) => {
    const { twinId, twinName, scenarioId, scenarioName, category, params, scenario } = req.body;
    const simId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert pending record
    await db.insert(simulations).values({
      id: simId,
      twinId,
      twinName,
      scenarioId,
      scenarioName,
      overallRisk: 'LOW',
      status: 'running',
      createdAt: now,
    });

    reply.status(202).send({ simulationId: simId });

    // Run async — don't await
    runSimulation({ simId, twinId, twinName, scenario, params: params as never, category: category as never })
      .then(async (report) => {
        await db
          .update(simulations)
          .set({ status: 'complete', report: JSON.stringify(report), overallRisk: report.overallRisk })
          .where(eq(simulations.id, simId));
      })
      .catch(async (err) => {
        console.error('Simulation error:', err);
        await db.update(simulations).set({ status: 'error' }).where(eq(simulations.id, simId));
      });
  });

  // SSE stream: GET /api/simulations/:id/stream
  app.get<{ Params: { id: string } }>('/api/simulations/:id/stream', async (req, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const sendEvent = (name: string, data: object) => {
      reply.raw.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Poll for completion
    const steps = [
      [15, 'Initialising twin state…'],
      [30, 'Loading scenario parameters…'],
      [50, 'Running AI inference engine…'],
      [70, 'Generating timeline phases…'],
      [85, 'Compiling recommendations…'],
      [95, 'Finalising report…'],
    ];

    for (const [pct, msg] of steps) {
      await new Promise((r) => setTimeout(r, 600));
      sendEvent('progress', { percent: pct, message: msg });

      // Check if already complete
      const [row] = await db.select().from(simulations).where(eq(simulations.id, req.params.id));
      if (row?.status === 'complete' && row.report) {
        sendEvent('complete', JSON.parse(row.report));
        reply.raw.end();
        return;
      }
    }

    // Final poll loop
    let attempts = 0;
    while (attempts < 30) {
      await new Promise((r) => setTimeout(r, 1000));
      const [row] = await db.select().from(simulations).where(eq(simulations.id, req.params.id));
      if (row?.status === 'complete' && row.report) {
        sendEvent('complete', JSON.parse(row.report));
        break;
      }
      if (row?.status === 'error') {
        sendEvent('error', { message: 'Simulation failed' });
        break;
      }
      attempts++;
    }

    reply.raw.end();
  });
}
