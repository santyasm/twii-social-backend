import { UsersService } from './users.service';

describe('UsersService', () => {
  it('create should normalize email/username and hash password', async () => {
    const prismaMock: any = {
      user: {
        create: jest
          .fn()
          .mockImplementation(({ data }) => ({ ...data, id: 'new-id' })),
      },
    };

    const service = new UsersService(prismaMock);

    const user = await service.create({
      name: 'Yasmin',
      username: 'YASMIn',
      email: 'TEST@MAIL.COM',
      password: 'plainpass',
    } as any);

    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(user.username).toBe('yasmin');
    expect(user.email).toBe('test@mail.com');
    expect(user.password).not.toBe('plainpass');
    expect(typeof user.password).toBe('string');
  });
});
