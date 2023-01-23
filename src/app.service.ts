import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { user_db } from './db';

@Injectable()
export class AppService {
  private twilioClient: Twilio;

  constructor(
    private readonly configService: ConfigService, //private readonly usersService: UsersService,
  ) {
    const accountSid = configService.get('TWILIO_ACCOUNT_SID');
    const authToken = configService.get('TWILIO_AUTH_TOKEN');

    this.twilioClient = new Twilio(accountSid, authToken);
  }
  getHello(): string {
    return 'Hello World!';
  }
  async sendOtp(phoneNumber: string) {
    const serviceSid = this.configService.get(
      'TWILIO_VERIFICATION_SERVICE_SID',
    );
    let msg = '';
    await this.twilioClient.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' })
      .then((verification) => (msg = verification.status));
    return { msg: msg };
  }
  async verifyOtp(phoneNumber: string, code: string) {
    const serviceSid = this.configService.get(
      'TWILIO_VERIFICATION_SERVICE_SID',
    );
    let msg = '';
    await this.twilioClient.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code: code })
      .then((verification) => (msg = verification.status));
    return { msg: msg };
  }
  async submit(phoneNumber: string, name: string) {
    var temp = user_db.find((user) => user.phone == phoneNumber);
    if (temp) {
      console.log(temp);
      return { msg: 'already', data: '' };
    } else {
      user_db.push({ name: name, phone: phoneNumber, isAuth: 1 });
      var data = await this.get(phoneNumber);
      return { msg: 'ok', data: data };
    }
  }
  async get(phoneNumber: string) {
    var data = user_db.find((user) => user.phone == phoneNumber);
    return { data: data };
  }
}
