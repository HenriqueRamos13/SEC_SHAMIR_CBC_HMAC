import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../services/AuthService';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export function authRoutes(fastify: FastifyInstance, authService: AuthService) {
  fastify.post('/register', {
    schema: {
      body: registerSchema,
      response: {
        200: z.object({ message: z.string(), userId: z.string() }),
        400: z.object({ error: z.string() }),
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof registerSchema> }>, reply) => {
    try {
      const { email, password, name } = request.body;
      const user = await authService.register(email, password, name);
      return { message: 'User registered successfully', userId: user.userId };
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.post('/login', {
    schema: {
      body: loginSchema,
      response: {
        200: z.object({ message: z.string(), token: z.string() }),
        401: z.object({ error: z.string() }),
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof loginSchema> }>, reply) => {
    try {
      const { email, password } = request.body;
      const token = await authService.login(email, password);

      reply.setCookie('token', token, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return { message: 'Login successful', token };
    } catch (error: any) {
      return reply.status(401).send({ error: error.message });
    }
  });

  fastify.post('/logout', {
    schema: {
      response: {
        200: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return { message: 'Logout successful' };
  });
}
