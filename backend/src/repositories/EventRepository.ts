import { Pool } from 'pg';
import { DomainEvent } from '../events';
import { IEventRepository } from '../interfaces/IEventRepository';

export class EventRepository implements IEventRepository {
  constructor(private readonly pool: Pool) {}

  async save(event: DomainEvent): Promise<void> {
    const query = `
      INSERT INTO events (event_type, aggregate_id, payload)
      VALUES ($1, $2, $3)
    `;

    await this.pool.query(query, [
      event.event_type,
      event.aggregate_id,
      event.payload,
    ]);
  }

  async getByType(eventType: string): Promise<DomainEvent[]> {
    const query = `
      SELECT * FROM events WHERE event_type = $1 ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [eventType]);
    return result.rows.map((row) => ({
      event_type: row.event_type,
      aggregate_id: row.aggregate_id,
      payload: row.payload,
    })) as DomainEvent[];
  }

  async getByAggregateId(aggregateId: string): Promise<DomainEvent[]> {
    const query = `
      SELECT * FROM events WHERE aggregate_id = $1 ORDER BY created_at ASC
    `;

    const result = await this.pool.query(query, [aggregateId]);
    return result.rows.map((row) => ({
      event_type: row.event_type,
      aggregate_id: row.aggregate_id,
      payload: row.payload,
    })) as DomainEvent[];
  }
}
