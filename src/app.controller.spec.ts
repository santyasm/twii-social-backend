import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should render HTML on root route', () => {
      const res: any = {
        type: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      appController.getHome(res);

      expect(res.type).toHaveBeenCalledWith('html');
      expect(res.send).toHaveBeenCalled();
      const html = (res.send as jest.Mock).mock.calls[0][0];
      expect(html).toContain('Twii API');
      expect(html).toContain('/docs');
    });
  });
});
