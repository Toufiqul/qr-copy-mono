import { Module } from '@nestjs/common';
import { TrpcService } from '@server/trpc/trpc.service';
import { TrpcRouter } from '@server/trpc/trpc.router';
import { FileController } from './trpc.router';

@Module({
  imports: [],
  controllers: [FileController],
  providers: [TrpcService, TrpcRouter],
})
export class TrpcModule {}
