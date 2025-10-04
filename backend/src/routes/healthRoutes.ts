import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', {
    schema: {
      response: {
        200: z.object({ status: z.string() }),
      },
    },
  }, async () => {
    return { status: 'ok' };
  });
}
