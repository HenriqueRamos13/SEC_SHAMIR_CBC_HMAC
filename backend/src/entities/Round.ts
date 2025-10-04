export interface Member {
  userId: string;
  email: string;
  name: string;
}

export class Round {
  constructor(
    public readonly roundId: string,
    public readonly groupId: string,
    public readonly groupName: string,
    public readonly members: Member[],
    public readonly threshold: number,
    public readonly encryptedList: string,
    public readonly iv: string,
    public readonly hmac: string,
    public readonly shares: string[],
    public readonly timestamp: string
  ) {}

  static create(
    roundId: string,
    groupId: string,
    groupName: string,
    members: Member[],
    threshold: number,
    encryptedList: string,
    iv: string,
    hmac: string,
    shares: string[]
  ): Round {
    return new Round(
      roundId,
      groupId,
      groupName,
      members,
      threshold,
      encryptedList,
      iv,
      hmac,
      shares,
      new Date().toISOString()
    );
  }
}
