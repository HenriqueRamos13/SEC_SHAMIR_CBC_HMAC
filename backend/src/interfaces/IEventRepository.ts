import { DomainEvent } from '../events';

export interface IEventRepository {
  save(event: DomainEvent): Promise<void>;
  getByType(eventType: string): Promise<DomainEvent[]>;
  getByAggregateId(aggregateId: string): Promise<DomainEvent[]>;
}
