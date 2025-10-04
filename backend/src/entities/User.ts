export class User {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly passwordHash: string
  ) {}

  static create(userId: string, email: string, name: string, passwordHash: string): User {
    return new User(userId, email, name, passwordHash);
  }
}
