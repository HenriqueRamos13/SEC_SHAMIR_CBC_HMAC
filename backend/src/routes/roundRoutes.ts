import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { RoundService } from '../services/RoundService';

const generateRoundSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  members: z.array(z.object({
    userId: z.string(),
    email: z.string().email(),
    name: z.string(),
  })),
  threshold: z.number().int().min(2),
});

const reconstructKeySchema = z.object({
  roundId: z.string(),
  shares: z.array(z.string()).min(2),
  encryptedList: z.string(),
  iv: z.string(),
  hmac: z.string(),
});

export function roundRoutes(
  fastify: FastifyInstance,
  roundService: RoundService,
  authenticateJWT: any
) {
  fastify.post('/generateRound', {
    preHandler: authenticateJWT,
    schema: {
      body: generateRoundSchema,
      response: {
        200: z.object({
          message: z.string(),
          roundId: z.string(),
          emailsSent: z.number(),
        }),
        400: z.object({ error: z.string() }),
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof generateRoundSchema> }>, reply) => {
    try {
      const { groupId, groupName, members, threshold } = request.body;
      const result = await roundService.generateRound(groupId, groupName, members, threshold);
      return { message: 'Round generated successfully', ...result };
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.post('/reconstructKey', {
    preHandler: authenticateJWT,
    schema: {
      body: reconstructKeySchema,
      response: {
        200: z.object({
          message: z.string(),
          decryptedList: z.string(),
          verified: z.boolean(),
        }),
        400: z.object({ error: z.string() }),
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof reconstructKeySchema> }>, reply) => {
    try {
      const { roundId, shares, encryptedList, iv, hmac } = request.body;
      const user = (request as any).user;

      const result = await roundService.reconstructKey(
        roundId,
        user.userId,
        shares,
        encryptedList,
        iv,
        hmac
      );

      return { message: 'Key reconstructed successfully', ...result };
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });
}
