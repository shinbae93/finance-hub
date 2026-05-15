import { Injectable } from '@nestjs/common';
import type { UserDto } from '@finance-hub/shared-api-types';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, fullName: true, createdAt: true },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt.toISOString() as UserDto['createdAt'],
    };
  }
}
