import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { TransportOptions } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error(
        'SMTP_USER and SMTP_PASS environment variables are required',
      );
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT!) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
      timeout: 10000,
      tls: {
        rejectUnauthorized: false,
      },
    } as TransportOptions);

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      throw new Error('Failed to connect to SMTP server');
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL environment variable is required');
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const htmlTemplate = this.getVerificationEmailTemplate(
      name,
      verificationUrl,
    );

    const mailOptions = {
      from: `"Twii Social" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Confirme seu email - Twii Social',
      html: htmlTemplate,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`, result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error sending verification email:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown email server error.';

      throw new InternalServerErrorException(
        `Failed to send verification email: ${errorMessage}`,
      );
    }
  }

  private getVerificationEmailTemplate(
    name: string,
    verificationUrl: string,
  ): string {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirme seu email - Twii Social</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #0D0D0D; /* Corrigido para preto/escuro para fundo branco do container */
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f7f7f7; /* Fundo claro para o corpo do email */
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #AEFF48;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                color: #0D0D0D;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #8adf23ff, #8ae31eff);
                color: white !important;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            .button:hover {
                transform: translateY(-2px);
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #9ca3af;
                font-size: 14px;
            }
            .highlight {
                background: #fef3c7;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #f59e0b;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Twii</div>
                <h1 class="title">Confirme seu email</h1>
            </div>
            
            <div class="content">
                <p style="color: #4a4a4a;">Olá <strong>${name}</strong>! 👋</p>
                
                <p style="color: #4a4a4a;">Bem-vindo(a) ao Twii! Estamos muito felizes em tê-lo(a) conosco.</p>
                
                <p style="color: #4a4a4a;">Para começar a usar sua conta, você precisa confirmar seu endereço de email clicando no botão abaixo:</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">
                        ✉️ Confirmar Email
                    </a>
                </div>
                
                <div class="highlight">
                    <strong>💡 Dica:</strong> Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
                    <a href="${verificationUrl}" style="color: #8ae31eff; word-break: break-all;">${verificationUrl}</a>
                </div>
                
                <p style="color: #4a4a4a;">Este link expira em 24 horas por motivos de segurança.</p>
                
                <p style="color: #4a4a4a;">Se você não criou uma conta no Twii Social, pode ignorar este email com segurança.</p>
            </div>
            
            <div class="footer">
                <p>Obrigado por escolher o Twii! 🎉</p>
                <p>Se você tiver alguma dúvida, não hesite em nos contatar.</p>
                <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                    Este é um email automático, por favor não responda a esta mensagem.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}
