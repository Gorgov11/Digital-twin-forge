import type { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { twins } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function twinRoutes(app: FastifyInstance) {
  // GET /api/twins
  app.get('/api/twins', async () => {
    const rows = await db.select().from(twins);
    return rows.map((r) => ({
      ...r,
      params: JSON.parse(r.params),
    }));
  });

  // GET /api/twins/:id
  app.get<{ Params: { id: string } }>('/api/twins/:id', async (req, reply) => {
    const [row] = await db.select().from(twins).where(eq(twins.id, req.params.id));
    if (!row) return reply.status(404).send({ error: 'Not found' });
    return { ...row, params: JSON.parse(row.params) };
  });

  // POST /api/twins
  app.post<{ Body: { id: string; name: string; modelId: string; category: string; params: object; healthScore: number } }>(
    '/api/twins',
    async (req, reply) => {
      const { id, name, modelId, category, params, healthScore } = req.body;
      const now = new Date().toISOString();
      const [row] = await db
        .insert(twins)
        .values({ id, name, modelId, category, params: JSON.stringify(params), healthScore, createdAt: now, updatedAt: now })
        .returning();
      reply.status(201);
      return { ...row, params: JSON.parse(row.params) };
    }
  );

  // PATCH /api/twins/:id
  app.patch<{ Params: { id: string }; Body: Partial<{ name: string; params: object; healthScore: number; simulationCount: number }> }>(
    '/api/twins/:id',
    async (req, reply) => {
      const { name, params: p, healthScore, simulationCount } = req.body;
      const [row] = await db
        .update(twins)
        .set({
          ...(name !== undefined && { name }),
          ...(p !== undefined && { params: JSON.stringify(p) }),
          ...(healthScore !== undefined && { healthScore }),
          ...(simulationCount !== undefined && { simulationCount }),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(twins.id, req.params.id))
        .returning();
      if (!row) return reply.status(404).send({ error: 'Not found' });
      return { ...row, params: JSON.parse(row.params) };
    }
  );

  // DELETE /api/twins/:id
  app.delete<{ Params: { id: string } }>('/api/twins/:id', async (req, reply) => {
    await db.delete(twins).where(eq(twins.id, req.params.id));
    reply.status(204).send();
  });
}
