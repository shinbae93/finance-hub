import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController.me', () => {
  it('returns the DTO for the authenticated user', async () => {
    const findById = jest.fn().mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      fullName: 'Jane',
      createdAt: '2026-05-14T00:00:00.000Z',
    });
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: { findById } }],
    }).compile();
    const controller = moduleRef.get(UsersController);

    const result = await controller.me({
      id: 'u1',
      email: 'a@b.com',
      fullName: 'Jane',
      createdAt: new Date('2026-05-14T00:00:00Z'),
    });
    expect(result.email).toBe('a@b.com');
    expect(findById).toHaveBeenCalledWith('u1');
  });
});
