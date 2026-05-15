import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService.findById', () => {
  it('returns the user DTO when found', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      fullName: 'Jane',
      createdAt: new Date('2026-05-14T00:00:00Z'),
    });
    const service = new UsersService({ user: { findUnique } } as unknown as PrismaService);
    const dto = await service.findById('u1');
    expect(dto).toEqual({
      id: 'u1',
      email: 'a@b.com',
      fullName: 'Jane',
      createdAt: '2026-05-14T00:00:00.000Z',
    });
  });

  it('returns null when not found', async () => {
    const service = new UsersService({
      user: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService);
    expect(await service.findById('u1')).toBeNull();
  });
});
