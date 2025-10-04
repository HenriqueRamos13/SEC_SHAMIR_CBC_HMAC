import { Pool } from 'pg';
import { DomainEvent } from './events';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'elpagador',
  user: 'elpagador',
  password: 'elpagador123',
});

export async function saveEvent(event: DomainEvent): Promise<void> {
  const query = `
    INSERT INTO events (event_type, aggregate_id, payload)
    VALUES ($1, $2, $3)
  `;

  await pool.query(query, [
    event.event_type,
    event.aggregate_id,
    event.payload,
  ]);
}

export async function getEventsByType(eventType: string): Promise<DomainEvent[]> {
  const query = `
    SELECT * FROM events WHERE event_type = $1 ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [eventType]);
  return result.rows.map((row) => ({
    event_type: row.event_type,
    aggregate_id: row.aggregate_id,
    payload: row.payload,
  })) as DomainEvent[];
}

export async function getEventsByAggregateId(aggregateId: string): Promise<DomainEvent[]> {
  const query = `
    SELECT * FROM events WHERE aggregate_id = $1 ORDER BY created_at ASC
  `;

  const result = await pool.query(query, [aggregateId]);
  return result.rows.map((row) => ({
    event_type: row.event_type,
    aggregate_id: row.aggregate_id,
    payload: row.payload,
  })) as DomainEvent[];
}

export async function getUserByEmail(email: string) {
  const events = await getEventsByType('UserRegistered');
  return events.find((e) => e.event_type === 'UserRegistered' && e.payload.email === email);
}

export async function getUserById(userId: string) {
  const events = await getEventsByAggregateId(userId);
  return events.find((e) => e.event_type === 'UserRegistered');
}

export async function getRoundById(roundId: string) {
  const events = await getEventsByAggregateId(roundId);
  return events.find((e) => e.event_type === 'RoundGenerated');
}

export { pool };
