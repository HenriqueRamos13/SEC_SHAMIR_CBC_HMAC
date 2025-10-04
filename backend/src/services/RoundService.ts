import { randomUUID } from 'crypto';
import { Round, Member } from '../entities/Round';
import { IRoundRepository } from '../interfaces/IRoundRepository';
import { ICryptoService } from '../interfaces/ICryptoService';
import { IEmailService } from '../interfaces/IEmailService';
import { IEventRepository } from '../interfaces/IEventRepository';

export class RoundService {
  constructor(
    private readonly roundRepository: IRoundRepository,
    private readonly cryptoService: ICryptoService,
    private readonly emailService: IEmailService,
    private readonly eventRepository: IEventRepository
  ) { }

  async generateRound(
    groupId: string,
    groupName: string,
    members: Member[],
    threshold: number
  ): Promise<{ roundId: string; emailsSent: number }> {
    if (members.length < threshold) {
      throw new Error('Not enough members for the threshold');
    }

    const payersCount = members.length - threshold + 1;
    if (payersCount < 1) {
      throw new Error('Invalid configuration');
    }


    const shuffled = [...members].sort(() => Math.random() - 0.5);
    const payers = shuffled.slice(0, payersCount);
    const payersList = payers.map((p) => p.name).join(', ');


    const encryptionResult = this.cryptoService.encrypt(payersList);


    const keyHex = encryptionResult.key.toString('hex');
    const shares = this.cryptoService.generateShares(keyHex, members.length, threshold);


    const roundId = randomUUID();
    const round = Round.create(
      roundId,
      groupId,
      groupName,
      members,
      threshold,
      encryptionResult.encryptedData,
      encryptionResult.iv,
      encryptionResult.hmac,
      shares
    );

    await this.roundRepository.save(round);

    let emailsSent = 0;
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const share = shares[i];

      const sent = await this.emailService.sendEmail({
        to: member.email,
        subject: `Your secret share for ${groupName} - Round ${roundId.slice(0, 8)}`,
        text: `Hello ${member.name},\n\nYour secret share: ${share}\n\nRound ID: ${roundId}\nEncrypted List: ${encryptionResult.encryptedData}\nIV: ${encryptionResult.iv}\nHMAC: ${encryptionResult.hmac}\n\nYou need ${threshold} shares to decrypt.\n\n- ElPAGADOR`,
        html: `<h2>Hello ${member.name},</h2>
          <p><strong>Your secret share:</strong> <code>${share}</code></p>
          <p><strong>Round ID:</strong> ${roundId}</p>
          <p><strong>Encrypted List:</strong> <code>${encryptionResult.encryptedData}</code></p>
          <p><strong>IV:</strong> <code>${encryptionResult.iv}</code></p>
          <p><strong>HMAC:</strong> <code>${encryptionResult.hmac}</code></p>
          <p>You need <strong>${threshold}</strong> friends to combine their shares and decrypt the list!</p>
          <p>- ElPAGADOR</p>`,
      });

      if (sent) emailsSent++;
    }

    return { roundId, emailsSent };
  }

  async reconstructKey(
    roundId: string,
    userId: string,
    shares: string[],
    encryptedList: string,
    iv: string,
    hmac: string
  ): Promise<{ decryptedList: string; verified: boolean }> {

    const keyHex = this.cryptoService.reconstructSecret(shares);
    const key = Buffer.from(keyHex, 'hex');


    const result = this.cryptoService.decrypt(encryptedList, iv, key, hmac);


    await this.eventRepository.save({
      event_type: 'KeyReconstructed',
      aggregate_id: roundId,
      payload: {
        roundId,
        userId,
        sharesUsed: shares.length,
        success: true,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      decryptedList: result.decryptedData,
      verified: result.verified,
    };
  }
}
