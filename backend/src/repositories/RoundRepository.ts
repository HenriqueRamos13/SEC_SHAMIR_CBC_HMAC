import { Round } from '../entities/Round';
import { IRoundRepository } from '../interfaces/IRoundRepository';
import { IEventRepository } from '../interfaces/IEventRepository';

export class RoundRepository implements IRoundRepository {
  constructor(private readonly eventRepository: IEventRepository) {}

  async findById(roundId: string): Promise<Round | null> {
    const events = await this.eventRepository.getByAggregateId(roundId);
    const roundEvent = events.find((e) => e.event_type === 'RoundGenerated');

    if (!roundEvent || roundEvent.event_type !== 'RoundGenerated') {
      return null;
    }

    const payload = roundEvent.payload;
    return new Round(
      payload.roundId,
      payload.groupId,
      '',
      [],
      payload.threshold,
      payload.encryptedList,
      payload.iv,
      payload.hmac,
      payload.shares,
      payload.timestamp
    );
  }

  async save(round: Round): Promise<void> {
    await this.eventRepository.save({
      event_type: 'RoundGenerated',
      aggregate_id: round.roundId,
      payload: {
        roundId: round.roundId,
        groupId: round.groupId,
        encryptedList: round.encryptedList,
        iv: round.iv,
        hmac: round.hmac,
        shares: round.shares,
        totalShares: round.shares.length,
        threshold: round.threshold,
        payersCount: round.members.length - round.threshold + 1,
        timestamp: round.timestamp,
      },
    });
  }
}
