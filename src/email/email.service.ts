import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    this.resend = new Resend(process.env.RESEND_API_KEY);
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

    try {
      const result = await this.resend.emails.send({
        from: process.env.SMTP_FROM || 'Twii <onboarding@resend.dev>',
        to: email,
        subject: 'Confirme seu email - Twii',
        html: htmlTemplate,
      });

      console.log(`✅ Verification email sent to ${email}`);
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

  async sendTestEmail(recipientEmail: string) {
    console.log(`Attempting to send test email to ${recipientEmail}...`);

    const testHtml = `
      <h1>Teste de Conexão Resend (Twii Social)</h1>
      <p>Este email confirma que a sua API Key do Resend e o seu domínio foram configurados corretamente.</p>
      <p>Domínio FROM: ${process.env.SMTP_FROM || 'onboarding@resend.dev'}</p>
      <p>Se você recebeu este e-mail, a integração está funcionando. 🎉</p>
    `;

    try {
      const result = await this.resend.emails.send({
        from: process.env.SMTP_FROM || 'Twii Test <onboarding@resend.dev>',
        to: recipientEmail,
        subject: '✅ Confirmação de Teste de Envio - Twii',
        html: testHtml,
      });

      console.log('✅ Test email sent successfully:', result);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending test email:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown email server error.';

      throw new InternalServerErrorException(
        `Failed to send test email via Resend: ${errorMessage}`,
      );
    }
  }

  private getVerificationEmailTemplate(
    name: string,
    verificationUrl: string,
  ): string {
    // Definindo as cores da sua marca para fácil manutenção
    const PRIMARY_COLOR = '#AEFF48';
    const BG_COLOR = '#f7f7f7';
    const CONTAINER_BG_COLOR = 'white';

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirme seu email - Twii Social</title>
        <style>
            /* CSS Global Otimizado */
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #0D0D0D;
                background-color: ${BG_COLOR};
            }
            .container-table {
                max-width: 600px;
                width: 100%;
                margin: 0 auto;
            }
            .header-cell {
                text-align: center;
                padding-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: ${PRIMARY_COLOR};
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, ${PRIMARY_COLOR}, #8ae31eff);
                color: #ffffff !important;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            .footer-cell {
                text-align: center;
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
    <body style="margin: 0; padding: 0; background-color: ${BG_COLOR};">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="container-table" role="presentation">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: ${CONTAINER_BG_COLOR}; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" role="presentation">
                        <tr>
                            <td style="padding: 40px;">
                                
                                <div class="header-cell">
                                    <div class="logo">Twii</div>
                                    <h1 style="font-size: 24px; color: #0D0D0D; margin-top: 10px; margin-bottom: 20px;">Confirme seu email</h1>
                                </div>
                                
                                <div class="content" style="color: #4a4a4a; margin-bottom: 30px;">
                                    <p style="color: #4a4a4a;">Olá <strong>${name}</strong>! 👋</p>
                                    
                                    <p style="color: #4a4a4a;">Bem-vindo(a) ao Twii! Estamos muito felizes em tê-lo(a) conosco.</p>
                                    
                                    <p style="color: #4a4a4a;">Para começar a usar sua conta, você precisa confirmar seu endereço de email clicando no botão abaixo:</p>
                                    
                                    <div style="text-align: center;">
                                        <a href="${verificationUrl}" class="button" style="color: white !important;">
                                            ✉️ Confirmar Email
                                        </a>
                                    </div>
                                    
                                    <div class="highlight">
                                        <strong>💡 Dica:</strong> Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
                                        <a href="${verificationUrl}" style="color: ${PRIMARY_COLOR}; word-break: break-all;">${verificationUrl}</a>
                                    </div>
                                    
                                    <p style="color: #4a4a4a;">Este link expira em 24 horas por motivos de segurança.</p>
                                    
                                    <p style="color: #4a4a4a;">Se você não criou uma conta no Twii Social, pode ignorar este email com segurança.</p>
                                </div>
                                
                                <div class="footer-cell">
                                    <p>Obrigado por escolher o Twii! 🎉</p>
                                    <p>Se você tiver alguma dúvida, não hesite em nos contatar.</p>
                                    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                                        Este é um email automático, por favor não responda a esta mensagem.
                                    </p>
                                </div>

                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
  }
}
