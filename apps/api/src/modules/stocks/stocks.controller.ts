import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import type {
  HoldingsDto,
  StockTransactionDto,
  SummaryDto,
  WinLossDto,
} from '@finance-hub/shared-api-types';
import { StocksService } from './stocks.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

interface AuthRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('stocks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocks: StocksService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'List all stock transactions' })
  listTransactions(@Req() req: AuthRequest): Promise<StockTransactionDto[]> {
    return this.stocks.listTransactions(req.user.id);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Create a stock transaction' })
  createTransaction(
    @Req() req: AuthRequest,
    @Body() dto: CreateTransactionDto,
  ): Promise<StockTransactionDto> {
    return this.stocks.createTransaction(req.user.id, dto);
  }

  @Delete('transactions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a stock transaction' })
  deleteTransaction(@Req() req: AuthRequest, @Param('id') id: string): Promise<void> {
    return this.stocks.deleteTransaction(req.user.id, id);
  }

  @Get('win-loss')
  @ApiOperation({ summary: 'FIFO-matched sell P&L grouped by ticker' })
  getWinLoss(@Req() req: AuthRequest): Promise<WinLossDto> {
    return this.stocks.getWinLoss(req.user.id);
  }

  @Get('holdings')
  @ApiOperation({ summary: 'Current holdings with cost basis' })
  getHoldings(@Req() req: AuthRequest): Promise<HoldingsDto> {
    return this.stocks.getHoldings(req.user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Portfolio cash flow summary' })
  getSummary(@Req() req: AuthRequest): Promise<SummaryDto> {
    return this.stocks.getSummary(req.user.id);
  }
}
