import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('getHomeHtml should contain title and links', () => {
    const html = service.getHomeHtml();
    expect(html).toContain('Twii API');
    expect(html).toContain('/docs');
    expect(html).toContain('github.com/santyasm/twii-social-backend');
  });

  it('getHomeHtml should use FRONTEND_URL when set', () => {
    const original = process.env.FRONTEND_URL;
    process.env.FRONTEND_URL = 'https://frontend.example.com';
    const html = service.getHomeHtml();
    expect(html).toContain('https://frontend.example.com');
    process.env.FRONTEND_URL = original;
  });
});
