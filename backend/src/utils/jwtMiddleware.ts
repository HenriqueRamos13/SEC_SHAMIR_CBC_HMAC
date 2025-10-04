import { AuthService } from '../services/AuthService';

export function createAuthMiddleware(authService: AuthService) {
  return async (request: any, reply: any) => {
    try {
      const token = request.cookies.token;
      if (!token) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      const decoded = authService.verifyToken(token);
      request.user = decoded;
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  };
}
