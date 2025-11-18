import { PostsService } from './posts.service';
import { NotFoundException } from '@nestjs/common';

describe('PostsService', () => {
  it('create should throw when authorId missing', async () => {
    const prismaMock: any = { post: { create: jest.fn() } };
    const service = new PostsService(prismaMock);

    await expect(
      service.create({ content: 'Hello' } as any, undefined, undefined),
    ).rejects.toThrow('Author ID is required to create a post.');
  });

  it('update should throw NotFound for missing post', async () => {
    const prismaMock: any = {
      post: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const service = new PostsService(prismaMock);

    await expect(
      service.update('id-1', { content: 'x' } as any, undefined, 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
