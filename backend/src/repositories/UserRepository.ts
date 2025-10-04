import { User } from '../entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IEventRepository } from '../interfaces/IEventRepository';

export class UserRepository implements IUserRepository {
  constructor(private readonly eventRepository: IEventRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    const events = await this.eventRepository.getByType('UserRegistered');
    const userEvent = events.find(
      (e) => e.event_type === 'UserRegistered' && e.payload.email === email
    );

    if (!userEvent || userEvent.event_type !== 'UserRegistered') {
      return null;
    }

    return User.create(
      userEvent.payload.userId,
      userEvent.payload.email,
      userEvent.payload.name,
      userEvent.payload.passwordHash
    );
  }

  async findById(userId: string): Promise<User | null> {
    const events = await this.eventRepository.getByAggregateId(userId);
    const userEvent = events.find((e) => e.event_type === 'UserRegistered');

    if (!userEvent || userEvent.event_type !== 'UserRegistered') {
      return null;
    }

    return User.create(
      userEvent.payload.userId,
      userEvent.payload.email,
      userEvent.payload.name,
      userEvent.payload.passwordHash
    );
  }

  async save(user: User): Promise<void> {
    await this.eventRepository.save({
      event_type: 'UserRegistered',
      aggregate_id: user.userId,
      payload: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
      },
    });
  }
}
