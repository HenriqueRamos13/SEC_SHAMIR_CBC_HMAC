import { Round } from '../entities/Round';

export interface IRoundRepository {
  findById(roundId: string): Promise<Round | null>;
  save(round: Round): Promise<void>;
}
