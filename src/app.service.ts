import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return process.env.HELLO || 'Hello World!';
  }

  getHomeHtml(): string {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Twii API - Rede Social</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #0a0a0a;
          color: #ffffffff;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
        }
        .container {
          max-width: 800px;
          padding: 2rem;
          background-color: #2d2d2d;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin: 2rem 0;
        }
        .logo {
          width: 120px;
          margin-bottom: 1.5rem;
        }
        h1 {
          color: white;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          color: #9d9d9dff;
        }
        .links {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2rem;
          flex-wrap: wrap;
        }
        .link-button {
          display: inline-flex;
          align-items: center;
          padding: 0.8rem 1.5rem;
          background-color: #8ac73e;
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .link-button:hover {
          background-color: #aeff48;
          transform: translateY(-2px);
        }
        .link-button svg {
          margin-right: 8px;
        }
        footer {
          margin-top: 3rem;
          color: #c1c1c1ff;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
      <svg width="95" height="95" viewBox="0 0 95 95" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="51.4583" y="43.542" width="43.5417" height="51.4583" rx="3" fill="#AEFF48" />
          <rect y="59.375" width="43.5417" height="35.625" rx="3" fill="#AEFF48" />
          <rect width="43.5417" height="51.4583" rx="3" fill="#AEFF48" />
          <rect x="51.4583" width="43.5417" height="35.625" rx="3" fill="#AEFF48" />
      </svg>
        <h1>Twii API</h1>
        <p>
          Bem-vindo à API do Twii, uma rede social inspirada no Twitter, desenvolvida com NestJS, Prisma e PostgreSQL.
          Esta API permite criar contas, seguir outros usuários, fazer posts com imagens, curtir, comentar e visualizar um feed dinâmico.
        </p>
        
        <div class="links">
          <a href="/docs" class="link-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Documentação API
          </a>
          
          <a href="https://github.com/santyasm/twii-social-backend" class="link-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            GitHub
          </a>
          
          <a href="${process.env.FRONTEND_URL || 'https://twii.yasminsantana.fun'}" class="link-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            Frontend
          </a>
        </div>
        
        <footer>
          <p>Desenvolvido por Yasmin Santana &copy; ${new Date().getFullYear()}</p>
        </footer>
      </div>
    </body>
    </html>
    `;
  }
}
