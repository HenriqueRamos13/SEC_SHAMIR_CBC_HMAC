import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { User } from '../entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IEventRepository } from '../interfaces/IEventRepository';

export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventRepository: IEventRepository,
    jwtSecret: string
  ) {
    this.jwtSecret = jwtSecret;
  }

  async register(email: string, password: string, name: string): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = User.create(userId, email, name, passwordHash);
    await this.userRepository.save(user);

    return user;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    await this.eventRepository.save({
      event_type: 'UserLoggedIn',
      aggregate_id: user.userId,
      payload: {
        userId: user.userId,
        timestamp: new Date().toISOString(),
      },
    });

    const token = jwt.sign({ userId: user.userId }, this.jwtSecret, { expiresIn: '7d' });
    return token;
  }

  verifyToken(token: string): { userId: string } {
    return jwt.verify(token, this.jwtSecret) as { userId: string };
  }
}
