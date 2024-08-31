import { Module } from '@nestjs/common';
import { TrpcService } from '@server/trpc/trpc.service';
import { TrpcRouter } from '@server/trpc/trpc.router';
import { FileController } from './trpc.router';
import { RedisService } from './redisService';
@Module({
  imports: [],
  controllers: [FileController],
  providers: [TrpcService, TrpcRouter, RedisService],
})
export class TrpcModule {}
