import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as ejs from 'ejs';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class EmailService {
  private mailer;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.configService = configService;
    this.mailer = nodemailer.createTransport({
      host: configService.get('mail.host', { infer: true }),
      port: configService.get('mail.port', { infer: true }),
      ignoreTLS: configService.get('mail.ignoreTLS', { infer: true }),
      secure: configService.get('mail.secure', { infer: true }),
      requireTLS: configService.get('mail.requireTLS', { infer: true }),
      auth: {
        user: configService.get('mail.user', { infer: true }),
        pass: configService.get('mail.password', { infer: true }),
      },
    });
  }

  async sendForgotPasswordMail(token: string) {
    let data: string;
    try {
      data = await ejs.renderFile(__dirname + '/templates/forgotPassword.ejs', {
        receiverName: ``, //`${user.firstName} ${user.lastName}`,
        verificationLink: `ADMIN_WEB_APP_URL+/reset-password/${token}`,
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Error loading mail template');
    }

    const mailOptions = {
      from: this.configService.get('mail.host', { infer: true }), // sender address
      to: 'toemail', // list of receivers
      subject: 'Reset Password', // Subject line
      text: 'Reset your password here!.', // plain text body
      html: data,
    };
    try {
      const info = await this.mailer.sendMail(mailOptions);
      return info.messageId;
    } catch (err) {
      console.error(err, `Error sending email to: user.email'`);
      throw new InternalServerErrorException(
        `Error sending email to: user.email`,
      );
    }
  }
}
