import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNumber, Max, Min, MinLength } from 'class-validator';
import type { CreateStockTransactionRequest, TransactionType } from '@finance-hub/shared-api-types';

export class CreateTransactionDto implements CreateStockTransactionRequest {
  @ApiProperty({ example: '2026-05-14' })
  @IsDateString()
  tradeDate!: string;

  @ApiProperty({ example: '2026-05-16' })
  @IsDateString()
  settlementDate!: string;

  @ApiProperty({ example: 'VNM', minLength: 2 })
  @MinLength(2)
  ticker!: string;

  @ApiProperty({ enum: ['MUA', 'BAN'] })
  @IsEnum(['MUA', 'BAN'])
  type!: TransactionType;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(1)
  volume!: number;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 0.0015, description: 'Fee rate as decimal, e.g. 0.0015 for 0.15%' })
  @IsNumber()
  @Min(0)
  @Max(1)
  feeRate!: number;
}
