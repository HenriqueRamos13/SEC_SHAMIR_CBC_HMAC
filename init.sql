CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(255),
    payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_aggregate ON events(aggregate_id);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
