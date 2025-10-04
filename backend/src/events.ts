// Event types for event sourcing

export type UserRegisteredEvent = {
  event_type: 'UserRegistered';
  aggregate_id: string; // userId
  payload: {
    userId: string;
    email: string;
    name: string;
    passwordHash: string;
  };
};

export type UserLoggedInEvent = {
  event_type: 'UserLoggedIn';
  aggregate_id: string; // userId
  payload: {
    userId: string;
    timestamp: string;
  };
};

export type RoundGeneratedEvent = {
  event_type: 'RoundGenerated';
  aggregate_id: string; // roundId
  payload: {
    roundId: string;
    groupId: string;
    encryptedList: string; // base64
    iv: string; // base64
    hmac: string; // hex
    shares: string[]; // hex shares
    totalShares: number;
    threshold: number;
    payersCount: number;
    timestamp: string;
  };
};

export type KeyReconstructedEvent = {
  event_type: 'KeyReconstructed';
  aggregate_id: string; // roundId
  payload: {
    roundId: string;
    userId: string;
    sharesUsed: number;
    success: boolean;
    timestamp: string;
  };
};

export type GroupCreatedEvent = {
  event_type: 'GroupCreated';
  aggregate_id: string; // groupId
  payload: {
    groupId: string;
    name: string;
    createdBy: string;
    members: string[]; // userIds
    threshold: number;
    timestamp: string;
  };
};

export type DomainEvent =
  | UserRegisteredEvent
  | UserLoggedInEvent
  | RoundGeneratedEvent
  | KeyReconstructedEvent
  | GroupCreatedEvent;
