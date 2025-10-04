import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { pool } from './db';
import { EventRepository } from './repositories/EventRepository';
import { UserRepository } from './repositories/UserRepository';
import { RoundRepository } from './repositories/RoundRepository';
import { CryptoService } from './services/CryptoService';
import { EmailService } from './services/EmailService';
import { AuthService } from './services/AuthService';
import { RoundService } from './services/RoundService';
import { authRoutes } from './routes/authRoutes';
import { roundRoutes } from './routes/roundRoutes';
import { healthRoutes } from './routes/healthRoutes';
import { createAuthMiddleware } from './utils/jwtMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'elpagador-super-secret-key';
const PORT = process.env.PORT || 3001;

const eventRepository = new EventRepository(pool);
const userRepository = new UserRepository(eventRepository);
const roundRepository = new RoundRepository(eventRepository);

const cryptoService = new CryptoService();
const emailService = new EmailService();
const authService = new AuthService(userRepository, eventRepository, JWT_SECRET);
const roundService = new RoundService(roundRepository, cryptoService, emailService, eventRepository);

const authenticateJWT = createAuthMiddleware(authService);

const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(fastifyCors, {
  origin: 'http://localhost:3000',
  credentials: true,
});

fastify.register(fastifyCookie);

fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'ElPAGADOR API',
      description: '',
      version: '1.0.0',
    },
  },
});

fastify.register(fastifySwaggerUI, {
  routePrefix: '/swagger',
});

authRoutes(fastify, authService);
roundRoutes(fastify, roundService, authenticateJWT);
healthRoutes(fastify);

const start = async () => {
  try {
    await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs on http://localhost:${PORT}/swagger`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
