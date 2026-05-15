import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { UserDto } from '@finance-hub/shared-api-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Current user profile' })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserDto> {
    const dto = await this.users.findById(user.id);
    if (!dto) throw new NotFoundException();
    return dto;
  }
}
